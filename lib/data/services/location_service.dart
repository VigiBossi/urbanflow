import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';

import '../../core/constants/app_constants.dart';

enum LocationStatus { granted, denied, deniedForever, serviceDisabled, error }

/// Result of a location lookup. When GPS is not usable, [position] falls back
/// to the Skopje city center and [isFallback] is true.
class LocationResult {
  const LocationResult({required this.position, required this.status});

  const LocationResult.fallback(this.status)
    : position = AppConstants.skopjeCenter;

  final LatLng position;
  final LocationStatus status;

  bool get isFallback => status != LocationStatus.granted;
}

/// Location contract so the UI and tests do not depend on platform plugins.
abstract interface class LocationService {
  Future<LocationResult> currentLocation();

  /// Opens system settings so the user can grant the permission.
  Future<void> openSettings();
}

/// [LocationService] backed by geolocator, with permission handling.
class GeolocatorLocationService implements LocationService {
  const GeolocatorLocationService();

  @override
  Future<LocationResult> currentLocation() async {
    try {
      if (!await Geolocator.isLocationServiceEnabled()) {
        return const LocationResult.fallback(LocationStatus.serviceDisabled);
      }
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied) {
        return const LocationResult.fallback(LocationStatus.denied);
      }
      if (permission == LocationPermission.deniedForever) {
        return const LocationResult.fallback(LocationStatus.deniedForever);
      }
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );
      return LocationResult(
        position: LatLng(position.latitude, position.longitude),
        status: LocationStatus.granted,
      );
    } on Exception {
      return const LocationResult.fallback(LocationStatus.error);
    }
  }

  @override
  Future<void> openSettings() async {
    final opened = await Geolocator.openAppSettings();
    if (!opened) await Geolocator.openLocationSettings();
  }
}

/// Fixed-position service for tests and demos.
class FixedLocationService implements LocationService {
  const FixedLocationService(this.result);

  final LocationResult result;

  @override
  Future<LocationResult> currentLocation() async => result;

  @override
  Future<void> openSettings() async {}
}
