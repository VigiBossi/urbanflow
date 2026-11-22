import '../models/parking_session.dart';
import '../models/parking_spot.dart';

class ParkingException implements Exception {
  const ParkingException(this.code);

  /// One of: `spotFull`, `noActiveSession`, `notFound`.
  final String code;

  @override
  String toString() => 'ParkingException($code)';
}

/// Parking backend contract.
abstract interface class ParkingRepository {
  /// All parking facilities with live availability.
  Future<List<ParkingSpot>> fetchSpots();

  /// Pays for and starts a session.
  Future<ParkingSession> startSession({
    required String userId,
    required ParkingSpot spot,
    required Duration duration,
    required String plate,
    required PaymentMethod paymentMethod,
  });

  /// Pays for and adds [extra] time to an active session.
  Future<ParkingSession> extendSession(String sessionId, Duration extra);

  /// Ends a session early.
  Future<ParkingSession> endSession(String sessionId);

  /// Marks a session as expired.
  Future<ParkingSession> expireSession(String sessionId);

  /// The user's active session, if any.
  Future<ParkingSession?> activeSession(String userId);

  /// Total parking revenue for today in MKD.
  Future<double> revenueToday();
}
