import 'dart:async';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../models/payment_model.dart';
import '../models/parking_spot_model.dart';
import '../services/notification_service.dart';

class PaymentProvider extends ChangeNotifier {
  ParkingSession? _activeSession;
  final List<ParkingSession> _history = [];
  bool _isLoading = false;
  String? _error;
  Timer? _expiryCheckTimer;
  final _uuid = const Uuid();

  ParkingSession? get activeSession => _activeSession;
  List<ParkingSession> get history => List.unmodifiable(_history);
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasActiveSession => _activeSession != null && _activeSession!.isActive;

  double calculateTotal(double pricePerHour, int durationMinutes) =>
      (pricePerHour / 60) * durationMinutes;

  Future<bool> startSession({
    required ParkingSpot spot,
    required String userId,
    required int durationMinutes,
    required PaymentMethod method,
    String? licensePlate,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 1200));

    // Simulate payment processing
    final now = DateTime.now();
    final total = calculateTotal(spot.pricePerHour, durationMinutes);

    _activeSession = ParkingSession(
      id: _uuid.v4(),
      userId: userId,
      parkingSpotId: spot.id,
      parkingSpotName: spot.name,
      parkingSpotAddress: spot.address,
      startTime: now,
      endTime: now.add(Duration(minutes: durationMinutes)),
      pricePerHour: spot.pricePerHour,
      totalAmount: total,
      status: PaymentStatus.active,
      paymentMethod: method,
      transactionId: 'TXN${DateTime.now().millisecondsSinceEpoch}',
      licensePlate: licensePlate,
    );

    _isLoading = false;
    notifyListeners();

    _startExpiryMonitor();
    return true;
  }

  Future<bool> extendSession(int additionalMinutes) async {
    if (_activeSession == null) return false;
    _isLoading = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 800));

    final additionalCost = calculateTotal(
        _activeSession!.pricePerHour, additionalMinutes);

    _activeSession = _activeSession!.copyWith(
      endTime: _activeSession!.endTime
          .add(Duration(minutes: additionalMinutes)),
      totalAmount: _activeSession!.totalAmount + additionalCost,
    );

    _isLoading = false;
    notifyListeners();
    return true;
  }

  Future<void> endSession() async {
    if (_activeSession == null) return;
    _isLoading = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 600));

    final completed = _activeSession!.copyWith(status: PaymentStatus.completed);
    _history.insert(0, completed);
    _activeSession = null;
    _expiryCheckTimer?.cancel();

    _isLoading = false;
    notifyListeners();
  }

  void _startExpiryMonitor() {
    _expiryCheckTimer?.cancel();
    _expiryCheckTimer = Timer.periodic(const Duration(minutes: 1), (_) {
      if (_activeSession == null) {
        _expiryCheckTimer?.cancel();
        return;
      }

      if (_activeSession!.isExpiringSoon &&
          !_activeSession!.expiryNotificationSent) {
        NotificationService().addParkingExpiryNotification(_activeSession!);
        _activeSession =
            _activeSession!.copyWith(expiryNotificationSent: true);
        notifyListeners();
      }

      if (_activeSession!.isExpired) {
        NotificationService().addParkingExpiredNotification(_activeSession!);
        endSession();
      }

      notifyListeners(); // Refresh timer display
    });
  }

  @override
  void dispose() {
    _expiryCheckTimer?.cancel();
    super.dispose();
  }
}
