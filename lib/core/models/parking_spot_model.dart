import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

enum ParkingStatus { available, limited, full, closed }

class ParkingSpot {
  final String id;
  final String name;
  final String address;
  final double lat;
  final double lng;
  final int totalSpots;
  final int availableSpots;
  final double pricePerHour;
  final ParkingStatus status;
  final List<String> amenities;
  final double? aiScore;
  final String? aiReason;
  final double? distanceMeters;
  final int? walkingMinutes;
  final String? zone;
  final bool is24Hours;
  final String? openTime;
  final String? closeTime;

  const ParkingSpot({
    required this.id,
    required this.name,
    required this.address,
    required this.lat,
    required this.lng,
    required this.totalSpots,
    required this.availableSpots,
    required this.pricePerHour,
    required this.status,
    this.amenities = const [],
    this.aiScore,
    this.aiReason,
    this.distanceMeters,
    this.walkingMinutes,
    this.zone,
    this.is24Hours = true,
    this.openTime,
    this.closeTime,
  });

  double get occupancyRate =>
      totalSpots > 0 ? (totalSpots - availableSpots) / totalSpots : 1.0;

  Color get statusColor {
    switch (status) {
      case ParkingStatus.available:
        return AppColors.parkingAvailable;
      case ParkingStatus.limited:
        return AppColors.parkingReserved;
      case ParkingStatus.full:
        return AppColors.parkingOccupied;
      case ParkingStatus.closed:
        return Colors.grey;
    }
  }

  String get statusLabel {
    switch (status) {
      case ParkingStatus.available:
        return 'Available';
      case ParkingStatus.limited:
        return 'Limited';
      case ParkingStatus.full:
        return 'Full';
      case ParkingStatus.closed:
        return 'Closed';
    }
  }

  String get formattedPrice => '\$${pricePerHour.toStringAsFixed(2)}/hr';

  String get formattedDistance {
    if (distanceMeters == null) return '';
    if (distanceMeters! < 1000) {
      return '${distanceMeters!.round()}m away';
    }
    return '${(distanceMeters! / 1000).toStringAsFixed(1)}km away';
  }

  ParkingSpot copyWith({
    int? availableSpots,
    ParkingStatus? status,
    double? aiScore,
    String? aiReason,
    double? distanceMeters,
    int? walkingMinutes,
  }) =>
      ParkingSpot(
        id: id,
        name: name,
        address: address,
        lat: lat,
        lng: lng,
        totalSpots: totalSpots,
        availableSpots: availableSpots ?? this.availableSpots,
        pricePerHour: pricePerHour,
        status: status ?? this.status,
        amenities: amenities,
        aiScore: aiScore ?? this.aiScore,
        aiReason: aiReason ?? this.aiReason,
        distanceMeters: distanceMeters ?? this.distanceMeters,
        walkingMinutes: walkingMinutes ?? this.walkingMinutes,
        zone: zone,
        is24Hours: is24Hours,
        openTime: openTime,
        closeTime: closeTime,
      );
}
