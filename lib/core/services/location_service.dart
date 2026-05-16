import 'dart:math';
import 'package:geolocator/geolocator.dart';

class LocationService {
  static Future<Position?> getCurrentPosition() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return null;

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) return null;
      }
      if (permission == LocationPermission.deniedForever) return null;

      return await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );
    } catch (_) {
      return null;
    }
  }

  /// Haversine formula — returns distance in meters.
  static double calculateDistance(
    double lat1,
    double lng1,
    double lat2,
    double lng2,
  ) {
    const R = 6371000.0;
    final phi1 = lat1 * pi / 180;
    final phi2 = lat2 * pi / 180;
    final dPhi = (lat2 - lat1) * pi / 180;
    final dLambda = (lng2 - lng1) * pi / 180;

    final a = sin(dPhi / 2) * sin(dPhi / 2) +
        cos(phi1) * cos(phi2) * sin(dLambda / 2) * sin(dLambda / 2);
    final c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return R * c;
  }

  static int calculateWalkingMinutes(double distanceMeters) =>
      (distanceMeters / 80).ceil(); // ~80m per minute walking

  /// Returns a mock address string based on coordinates.
  static String mockAddressFromCoordinates(double lat, double lng) {
    final streets = [
      'Rruga Ilindenska',
      'Bul. Partizanski Odredi',
      'Rruga Shën Klimenti',
      'Bulevar Demokratija',
      'Rruga Makedonija',
      'Ul. Bihacka',
      'Rruga Naim Frashëri',
      'Ul. Vasil Gjorgov',
    ];
    final index = ((lat + lng) * 100).abs().toInt() % streets.length;
    final number = ((lat * lng).abs() * 100).toInt() % 150 + 1;
    return '${streets[index]} $number, Skopje';
  }
}
