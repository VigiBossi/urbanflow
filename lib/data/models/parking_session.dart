enum ParkingSessionStatus { active, ended, expired }

enum PaymentMethod { card, mobileWallet, sms }

/// A paid parking session.
class ParkingSession {
  const ParkingSession({
    required this.id,
    required this.userId,
    required this.spotId,
    required this.spotName,
    required this.plate,
    required this.startTime,
    required this.endTime,
    required this.pricePerHour,
    required this.amountPaid,
    required this.paymentMethod,
    required this.status,
  });

  final String id;
  final String userId;
  final String spotId;
  final String spotName;
  final String plate;
  final DateTime startTime;
  final DateTime endTime;
  final double pricePerHour;
  final double amountPaid;
  final PaymentMethod paymentMethod;
  final ParkingSessionStatus status;

  bool get isActive => status == ParkingSessionStatus.active;

  Duration get totalDuration => endTime.difference(startTime);

  /// Time left at [now], never negative.
  Duration remaining(DateTime now) {
    final diff = endTime.difference(now);
    return diff.isNegative ? Duration.zero : diff;
  }

  /// Fraction (0..1) of the session that has elapsed at [now].
  double progress(DateTime now) {
    final total = totalDuration.inSeconds;
    if (total <= 0) return 1;
    final elapsed = now.difference(startTime).inSeconds;
    return (elapsed / total).clamp(0.0, 1.0);
  }

  ParkingSession copyWith({
    DateTime? endTime,
    double? amountPaid,
    ParkingSessionStatus? status,
  }) => ParkingSession(
    id: id,
    userId: userId,
    spotId: spotId,
    spotName: spotName,
    plate: plate,
    startTime: startTime,
    endTime: endTime ?? this.endTime,
    pricePerHour: pricePerHour,
    amountPaid: amountPaid ?? this.amountPaid,
    paymentMethod: paymentMethod,
    status: status ?? this.status,
  );

  /// Cost of parking for [duration] at [pricePerHour], rounded to whole MKD.
  static double costFor(Duration duration, double pricePerHour) =>
      (duration.inMinutes / 60 * pricePerHour).roundToDouble();

  factory ParkingSession.fromJson(Map<String, dynamic> json) => ParkingSession(
    id: json['id'] as String,
    userId: json['userId'] as String,
    spotId: json['spotId'] as String,
    spotName: json['spotName'] as String,
    plate: json['plate'] as String,
    startTime: DateTime.parse(json['startTime'] as String),
    endTime: DateTime.parse(json['endTime'] as String),
    pricePerHour: (json['pricePerHour'] as num).toDouble(),
    amountPaid: (json['amountPaid'] as num).toDouble(),
    paymentMethod: PaymentMethod.values.byName(json['paymentMethod'] as String),
    status: ParkingSessionStatus.values.byName(json['status'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'userId': userId,
    'spotId': spotId,
    'spotName': spotName,
    'plate': plate,
    'startTime': startTime.toIso8601String(),
    'endTime': endTime.toIso8601String(),
    'pricePerHour': pricePerHour,
    'amountPaid': amountPaid,
    'paymentMethod': paymentMethod.name,
    'status': status.name,
  };
}
