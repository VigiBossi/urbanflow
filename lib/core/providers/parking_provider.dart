import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import '../models/parking_spot_model.dart';
import '../services/ai_service.dart';
import '../services/location_service.dart';

class ParkingProvider extends ChangeNotifier {
  List<ParkingSpot> _spots = [];
  ParkingSpot? _selectedSpot;
  bool _isLoading = false;
  double? _userLat;
  double? _userLng;
  ParkingStatus? _statusFilter;
  String _searchQuery = '';
  Timer? _refreshTimer;
  final _rng = Random();

  List<ParkingSpot> get spots => _filteredSpots;
  List<ParkingSpot> get allSpots => _spots;
  ParkingSpot? get selectedSpot => _selectedSpot;
  bool get isLoading => _isLoading;
  double? get userLat => _userLat;
  double? get userLng => _userLng;
  ParkingStatus? get statusFilter => _statusFilter;

  ParkingSpot? get aiRecommendedSpot =>
      _spots.isNotEmpty ? _spots.first : null;

  List<ParkingSpot> get _filteredSpots {
    var result = _spots;
    if (_statusFilter != null) {
      result = result.where((s) => s.status == _statusFilter).toList();
    }
    if (_searchQuery.isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      result = result
          .where((s) =>
              s.name.toLowerCase().contains(q) ||
              s.address.toLowerCase().contains(q))
          .toList();
    }
    return result;
  }

  Future<void> loadNearbySpots() async {
    _isLoading = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 800));

    // Try getting real location, fall back to Skopje city center
    final pos = await LocationService.getCurrentPosition();
    _userLat = pos?.latitude ?? 41.9965;
    _userLng = pos?.longitude ?? 21.4314;

    _spots = _generateMockSpots(_userLat!, _userLng!);
    _spots = AiService.rankParkingSpots(
      spots: _spots,
      userLat: _userLat!,
      userLng: _userLng!,
    );

    _isLoading = false;
    notifyListeners();

    // Simulate real-time availability updates every 30s
    _refreshTimer?.cancel();
    _refreshTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      _simulateAvailabilityUpdate();
    });
  }

  void _simulateAvailabilityUpdate() {
    _spots = _spots.map((spot) {
      if (spot.status == ParkingStatus.closed) return spot;
      final change = _rng.nextInt(5) - 2; // -2 to +2
      final newAvail =
          (spot.availableSpots + change).clamp(0, spot.totalSpots);
      ParkingStatus newStatus;
      if (newAvail == 0) {
        newStatus = ParkingStatus.full;
      } else if (newAvail <= spot.totalSpots * 0.3) {
        newStatus = ParkingStatus.limited;
      } else {
        newStatus = ParkingStatus.available;
      }
      return spot.copyWith(availableSpots: newAvail, status: newStatus);
    }).toList();
    notifyListeners();
  }

  void selectSpot(ParkingSpot? spot) {
    _selectedSpot = spot;
    notifyListeners();
  }

  void setStatusFilter(ParkingStatus? status) {
    _statusFilter = status;
    notifyListeners();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  List<ParkingSpot> _generateMockSpots(double baseLat, double baseLng) {
    final spotsData = [
      ('City Center Parking', 0.003, 0.001, 80, 42, 1.20, ['covered', 'ev_charging', 'handicap']),
      ('Old Bazaar Lot', 0.005, -0.004, 50, 8, 0.80, ['handicap']),
      ('Macedonia Square Garage', -0.002, 0.006, 200, 65, 1.50, ['covered', 'security', 'ev_charging']),
      ('River Park Lot', 0.008, 0.002, 120, 0, 0.60, ['open_air']),
      ('Bit Pazar Open Lot', -0.005, -0.003, 60, 38, 0.50, ['open_air']),
      ('Business District Garage', 0.006, 0.008, 300, 124, 2.00, ['covered', 'security', 'ev_charging', 'handicap']),
      ('Novo Lisice Lot', 0.012, 0.005, 40, 40, 0.40, ['open_air']),
      ('Aerodrom Parking', -0.009, 0.007, 90, 22, 0.70, ['handicap']),
    ];

    return spotsData.asMap().entries.map((entry) {
      final i = entry.key;
      final d = entry.value;
      final lat = baseLat + d.$2;
      final lng = baseLng + d.$3;
      final total = d.$4 as int;
      final available = d.$5 as int;
      final dist = LocationService.calculateDistance(
          baseLat, baseLng, lat, lng);

      ParkingStatus status;
      if (available == 0) {
        status = ParkingStatus.full;
      } else if (available <= total * 0.3) {
        status = ParkingStatus.limited;
      } else {
        status = ParkingStatus.available;
      }

      return ParkingSpot(
        id: 'spot_$i',
        name: d.$1,
        address: LocationService.mockAddressFromCoordinates(lat, lng),
        lat: lat,
        lng: lng,
        totalSpots: total,
        availableSpots: available,
        pricePerHour: d.$6 as double,
        status: status,
        amenities: List<String>.from(d.$7 as List),
        distanceMeters: dist,
        walkingMinutes: LocationService.calculateWalkingMinutes(dist),
        zone: ['A', 'B', 'C'][i % 3],
        is24Hours: i % 4 != 3,
      );
    }).toList();
  }
}
