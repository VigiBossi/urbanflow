import 'package:flutter/foundation.dart';
import 'package:latlong2/latlong.dart';

import '../core/constants/app_constants.dart';
import '../data/services/location_service.dart';

/// Current user position with a fallback to Skopje center.
class LocationProvider extends ChangeNotifier {
  LocationProvider(this._service);

  final LocationService _service;

  LatLng _position = AppConstants.skopjeCenter;
  LocationStatus? _status;
  bool _loading = false;

  LatLng get position => _position;
  LocationStatus? get status => _status;
  bool get isLoading => _loading;

  /// True when the position is the Skopje fallback rather than GPS.
  bool get isFallback => _status != null && _status != LocationStatus.granted;

  Future<void> refresh() async {
    if (_loading) return;
    _loading = true;
    notifyListeners();
    final result = await _service.currentLocation();
    _position = result.position;
    _status = result.status;
    _loading = false;
    notifyListeners();
  }

  Future<void> openSettings() => _service.openSettings();
}
