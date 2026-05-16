enum PaymentStatus { pending, active, completed, cancelled, expired }

enum PaymentMethod { card, applePay, googlePay, cash, local }

class ParkingSession {
  final String id;
  final String userId;
  final String parkingSpotId;
  final String parkingSpotName;
  final String parkingSpotAddress;
  final DateTime startTime;
  final DateTime endTime;
  final double pricePerHour;
  final double totalAmount;
  final PaymentStatus status;
  final PaymentMethod paymentMethod;
  final String? transactionId;
  final String? licensePlate;
  final bool expiryNotificationSent;

  const ParkingSession({
    required this.id,
    required this.userId,
    required this.parkingSpotId,
    required this.parkingSpotName,
    required this.parkingSpotAddress,
    required this.startTime,
    required this.endTime,
    required this.pricePerHour,
    required this.totalAmount,
    required this.status,
    required this.paymentMethod,
    this.transactionId,
    this.licensePlate,
    this.expiryNotificationSent = false,
  });

  Duration get duration => endTime.difference(startTime);

  Duration get remaining {
    final now = DateTime.now();
    if (now.isAfter(endTime)) return Duration.zero;
    return endTime.difference(now);
  }

  bool get isActive => status == PaymentStatus.active;

  bool get isExpiringSoon =>
      isActive && remaining.inMinutes <= 10 && remaining.inMinutes > 0;

  bool get isExpired => isActive && DateTime.now().isAfter(endTime);

  double get progressFraction {
    final total = duration.inSeconds;
    final elapsed = DateTime.now().difference(startTime).inSeconds;
    return (elapsed / total).clamp(0.0, 1.0);
  }

  String get formattedRemaining {
    final r = remaining;
    if (r == Duration.zero) return 'Expired';
    final h = r.inHours;
    final m = r.inMinutes.remainder(60);
    if (h > 0) return '${h}h ${m}m remaining';
    return '${m}m remaining';
  }

  String get paymentMethodLabel {
    switch (paymentMethod) {
      case PaymentMethod.card:
        return 'Credit/Debit Card';
      case PaymentMethod.applePay:
        return 'Apple Pay';
      case PaymentMethod.googlePay:
        return 'Google Pay';
      case PaymentMethod.cash:
        return 'Cash';
      case PaymentMethod.local:
        return 'Local Payment';
    }
  }

  ParkingSession copyWith({
    PaymentStatus? status,
    DateTime? endTime,
    double? totalAmount,
    bool? expiryNotificationSent,
  }) =>
      ParkingSession(
        id: id,
        userId: userId,
        parkingSpotId: parkingSpotId,
        parkingSpotName: parkingSpotName,
        parkingSpotAddress: parkingSpotAddress,
        startTime: startTime,
        endTime: endTime ?? this.endTime,
        pricePerHour: pricePerHour,
        totalAmount: totalAmount ?? this.totalAmount,
        status: status ?? this.status,
        paymentMethod: paymentMethod,
        transactionId: transactionId,
        licensePlate: licensePlate,
        expiryNotificationSent:
            expiryNotificationSent ?? this.expiryNotificationSent,
      );
}
