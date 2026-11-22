import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:latlong2/latlong.dart';

import '../core/constants/app_constants.dart';
import '../data/models/parking_session.dart';
import '../data/models/parking_spot.dart';
import '../data/repositories/parking_repository.dart';
import '../data/services/parking_scorer.dart';
import 'view_status.dart';

enum RankingPreset { balanced, closest, cheapest, mostAvailable }

/// Alerts raised while a session is running; consumed by the UI once.
enum ParkingAlert { none, tenMinutesLeft, expired }

/// Parking spots, AI ranking and the user's active session.
class ParkingProvider extends ChangeNotifier {
  ParkingProvider({
    required this.repository,
    this.baseScorer = const ParkingScorer(),
    DateTime Function()? clock,
    this.refreshInterval = AppConstants.parkingRefreshInterval,
    this.warningThreshold = AppConstants.sessionWarningThreshold,
  }) : _clock = clock ?? DateTime.now;

  final ParkingRepository repository;

  /// Scorer whose limits are used; weights change with the preset.
  final ParkingScorer baseScorer;
  late ParkingScorer _scorer = baseScorer;
  final DateTime Function() _clock;
  final Duration refreshInterval;
  final Duration warningThreshold;

  ViewStatus _status = ViewStatus.initial;
  List<ParkingSpot> _spots = const [];
  List<ScoredParkingSpot> _ranked = const [];
  LatLng _origin = AppConstants.skopjeCenter;
  RankingPreset _preset = RankingPreset.balanced;
  DateTime? _lastUpdated;

  String? _userId;
  ParkingSession? _session;
  ParkingAlert _pendingAlert = ParkingAlert.none;
  bool _warningRaised = false;
  bool _busy = false;

  Timer? _refreshTimer;
  Timer? _ticker;

  ViewStatus get status => _status;
  List<ParkingSpot> get spots => _spots;
  List<ScoredParkingSpot> get rankedSpots => _ranked;
  RankingPreset get preset => _preset;
  DateTime? get lastUpdated => _lastUpdated;
  ParkingSession? get activeSession => _session;
  ParkingAlert get pendingAlert => _pendingAlert;
  bool get isBusy => _busy;
  DateTime get now => _clock();

  Duration get remaining => _session?.remaining(_clock()) ?? Duration.zero;

  bool get isInWarningWindow =>
      _session != null &&
      _session!.isActive &&
      remaining > Duration.zero &&
      remaining <= warningThreshold;

  static ScoringWeights weightsFor(RankingPreset preset) => switch (preset) {
    RankingPreset.balanced => ScoringWeights.balanced,
    RankingPreset.closest => ScoringWeights.closest,
    RankingPreset.cheapest => ScoringWeights.cheapest,
    RankingPreset.mostAvailable => ScoringWeights.mostAvailable,
  };

  ScoredParkingSpot? scoredById(String id) {
    for (final s in _ranked) {
      if (s.spot.id == id) return s;
    }
    return null;
  }

  /// Called when the user's position changes.
  void updateOrigin(LatLng origin) {
    if (origin == _origin) return;
    _origin = origin;
    _rerank();
  }

  void setPreset(RankingPreset preset) {
    if (preset == _preset) return;
    _preset = preset;
    _scorer = baseScorer.withWeights(weightsFor(preset));
    _rerank();
  }

  void _rerank() {
    _ranked = _scorer.rank(_spots, _origin, _clock());
    notifyListeners();
  }

  /// Loads spots and the active session for [userId] and starts live updates.
  Future<void> start(String userId) async {
    if (_userId != userId) {
      _session = null;
      _pendingAlert = ParkingAlert.none;
      _warningRaised = false;
    }
    _userId = userId;
    await Future.wait([loadSpots(), _loadSession()]);
    _refreshTimer?.cancel();
    if (refreshInterval > Duration.zero) {
      _refreshTimer = Timer.periodic(
        refreshInterval,
        (_) => loadSpots(silent: true),
      );
    }
  }

  /// Stops timers (e.g. on logout).
  void stop() {
    _refreshTimer?.cancel();
    _ticker?.cancel();
    _refreshTimer = null;
    _ticker = null;
    _userId = null;
    _session = null;
    _pendingAlert = ParkingAlert.none;
  }

  Future<void> loadSpots({bool silent = false}) async {
    if (!silent || _status != ViewStatus.ready) {
      _status = ViewStatus.loading;
      notifyListeners();
    }
    try {
      _spots = await repository.fetchSpots();
      _lastUpdated = _clock();
      _status = ViewStatus.ready;
      _rerank();
    } on Exception {
      if (!silent || _spots.isEmpty) {
        _status = ViewStatus.error;
        notifyListeners();
      }
    }
  }

  Future<void> _loadSession() async {
    final userId = _userId;
    if (userId == null) return;
    try {
      _session = await repository.activeSession(userId);
    } on Exception {
      _session = null;
    }
    _warningRaised = false;
    _syncTicker();
    _tick();
  }

  Future<ParkingSession> startSession({
    required ParkingSpot spot,
    required Duration duration,
    required String plate,
    required PaymentMethod method,
  }) async {
    final userId = _userId;
    if (userId == null) throw const ParkingException('notSignedIn');
    _busy = true;
    notifyListeners();
    try {
      final session = await repository.startSession(
        userId: userId,
        spot: spot,
        duration: duration,
        plate: plate,
        paymentMethod: method,
      );
      _session = session;
      _warningRaised = duration <= warningThreshold;
      _pendingAlert = ParkingAlert.none;
      _syncTicker();
      unawaited(loadSpots(silent: true));
      return session;
    } finally {
      _busy = false;
      notifyListeners();
    }
  }

  Future<void> extendSession(Duration extra) async {
    final session = _session;
    if (session == null) return;
    _busy = true;
    notifyListeners();
    try {
      _session = await repository.extendSession(session.id, extra);
      if (remaining > warningThreshold) _warningRaised = false;
      _syncTicker();
    } finally {
      _busy = false;
      notifyListeners();
    }
  }

  Future<void> endSession() async {
    final session = _session;
    if (session == null) return;
    _busy = true;
    notifyListeners();
    try {
      await repository.endSession(session.id);
      _session = null;
      _pendingAlert = ParkingAlert.none;
      _syncTicker();
    } finally {
      _busy = false;
      notifyListeners();
    }
  }

  /// Clears the pending alert after the UI has shown it.
  void acknowledgeAlert() {
    if (_pendingAlert == ParkingAlert.expired) {
      _session = null;
      _syncTicker();
    }
    _pendingAlert = ParkingAlert.none;
    notifyListeners();
  }

  void _syncTicker() {
    final shouldRun = _session?.isActive ?? false;
    if (shouldRun && _ticker == null) {
      _ticker = Timer.periodic(const Duration(seconds: 1), (_) => _tick());
    } else if (!shouldRun) {
      _ticker?.cancel();
      _ticker = null;
    }
  }

  /// Advances the countdown; exposed for tests.
  @visibleForTesting
  void tick() => _tick();

  void _tick() {
    final session = _session;
    if (session == null || !session.isActive) return;
    final left = session.remaining(_clock());
    if (left == Duration.zero) {
      _session = session.copyWith(status: ParkingSessionStatus.expired);
      _pendingAlert = ParkingAlert.expired;
      _syncTicker();
      unawaited(
        repository.expireSession(session.id).then((_) {}, onError: (_) {}),
      );
    } else if (left <= warningThreshold && !_warningRaised) {
      _warningRaised = true;
      _pendingAlert = ParkingAlert.tenMinutesLeft;
    }
    notifyListeners();
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _ticker?.cancel();
    super.dispose();
  }
}
