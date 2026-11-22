import 'dart:math' as math;

import 'package:latlong2/latlong.dart';

/// Geographic helpers that do not depend on platform services.
abstract final class GeoUtils {
  static const double _earthRadiusMeters = 6371000;

  /// Great-circle distance between [a] and [b] in meters (haversine).
  static double distanceMeters(LatLng a, LatLng b) {
    final dLat = _rad(b.latitude - a.latitude);
    final dLng = _rad(b.longitude - a.longitude);
    final h =
        math.pow(math.sin(dLat / 2), 2) +
        math.cos(_rad(a.latitude)) *
            math.cos(_rad(b.latitude)) *
            math.pow(math.sin(dLng / 2), 2);
    return 2 * _earthRadiusMeters * math.asin(math.sqrt(h.toDouble()));
  }

  static double _rad(double deg) => deg * math.pi / 180;
}
