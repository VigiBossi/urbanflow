import 'dart:math' as math;

import '../../../core/constants/app_constants.dart';
import '../../../core/utils/id_generator.dart';
import '../../mock/mock_network.dart';
import '../../mock/skopje_data.dart';
import '../../models/parking_session.dart';
import '../../models/parking_spot.dart';
import '../../services/local_store.dart';
import '../parking_repository.dart';

/// Simulated parking backend. Availability drifts randomly on every fetch to
/// mimic live sensor data; sessions are persisted in [LocalStore].
class MockParkingRepository implements ParkingRepository {
  MockParkingRepository({
    required this.store,
    this.network = MockNetwork.instant,
    DateTime Function()? clock,
    math.Random? random,
  }) : _clock = clock ?? DateTime.now,
       _random = random ?? math.Random(),
       _spots = SkopjeData.parkingSpots();

  final LocalStore store;
  final MockNetwork network;
  final DateTime Function() _clock;
  final math.Random _random;
  List<ParkingSpot> _spots;

  /// Baseline revenue from other drivers today (simulated).
  double _baselineRevenue(DateTime now) {
    final hour = now.hour + now.minute / 60;
    return (hour * 4200).roundToDouble();
  }

  List<ParkingSession> _loadSessions() => store
      .getJsonList(StorageKeys.parkingSessions)
      .map(ParkingSession.fromJson)
      .toList();

  Future<void> _saveSessions(List<ParkingSession> sessions) =>
      store.setJsonList(
        StorageKeys.parkingSessions,
        sessions.map((s) => s.toJson()).toList(),
      );

  @override
  Future<List<ParkingSpot>> fetchSpots() => network.run(() {
    _spots = _spots.map((spot) {
      final swing = math.max(1, (spot.capacity * 0.04).round());
      final delta = _random.nextInt(swing * 2 + 1) - swing;
      return spot.copyWith(
        available: (spot.available + delta).clamp(0, spot.capacity),
      );
    }).toList();
    return List.unmodifiable(_spots);
  });

  @override
  Future<ParkingSession> startSession({
    required String userId,
    required ParkingSpot spot,
    required Duration duration,
    required String plate,
    required PaymentMethod paymentMethod,
  }) async {
    final sessions = await network.run(_loadSessions);
    final current = _spots.firstWhere(
      (s) => s.id == spot.id,
      orElse: () => spot,
    );
    if (current.isFull) throw const ParkingException('spotFull');

    final now = _clock();
    // Only one active session per user: close any previous one.
    final updated = sessions
        .map(
          (s) => s.userId == userId && s.isActive
              ? s.copyWith(status: ParkingSessionStatus.ended, endTime: now)
              : s,
        )
        .toList();
    final session = ParkingSession(
      id: IdGenerator.next('ps'),
      userId: userId,
      spotId: spot.id,
      spotName: spot.name,
      plate: plate.trim().toUpperCase(),
      startTime: now,
      endTime: now.add(duration),
      pricePerHour: spot.pricePerHour,
      amountPaid: ParkingSession.costFor(duration, spot.pricePerHour),
      paymentMethod: paymentMethod,
      status: ParkingSessionStatus.active,
    );
    updated.add(session);
    await _saveSessions(updated);
    _spots = _spots
        .map(
          (s) => s.id == spot.id ? s.copyWith(available: s.available - 1) : s,
        )
        .toList();
    return session;
  }

  Future<ParkingSession> _update(
    String sessionId,
    ParkingSession Function(ParkingSession) change,
  ) async {
    final sessions = await network.run(_loadSessions);
    final index = sessions.indexWhere((s) => s.id == sessionId);
    if (index < 0) throw const ParkingException('notFound');
    final updated = change(sessions[index]);
    sessions[index] = updated;
    await _saveSessions(sessions);
    return updated;
  }

  @override
  Future<ParkingSession> extendSession(String sessionId, Duration extra) =>
      _update(sessionId, (s) {
        if (!s.isActive) throw const ParkingException('noActiveSession');
        final now = _clock();
        final base = s.endTime.isAfter(now) ? s.endTime : now;
        return s.copyWith(
          endTime: base.add(extra),
          amountPaid:
              s.amountPaid + ParkingSession.costFor(extra, s.pricePerHour),
        );
      });

  @override
  Future<ParkingSession> endSession(String sessionId) => _update(
    sessionId,
    (s) => s.copyWith(status: ParkingSessionStatus.ended, endTime: _clock()),
  );

  @override
  Future<ParkingSession> expireSession(String sessionId) => _update(
    sessionId,
    (s) => s.copyWith(status: ParkingSessionStatus.expired),
  );

  @override
  Future<ParkingSession?> activeSession(String userId) => network.run(() {
    final sessions = _loadSessions();
    for (final s in sessions.reversed) {
      if (s.userId == userId && s.isActive) return s;
    }
    return null;
  });

  @override
  Future<double> revenueToday() => network.run(() {
    final now = _clock();
    final own = _loadSessions()
        .where(
          (s) =>
              s.startTime.year == now.year &&
              s.startTime.month == now.month &&
              s.startTime.day == now.day,
        )
        .fold<double>(0, (sum, s) => sum + s.amountPaid);
    return _baselineRevenue(now) + own;
  });
}
