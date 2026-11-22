import 'package:latlong2/latlong.dart';

enum ParkingType { street, garage, lot }

/// A parking facility (street zone, garage or open lot).
class ParkingSpot {
  const ParkingSpot({
    required this.id,
    required this.name,
    required this.neighborhood,
    required this.latitude,
    required this.longitude,
    required this.capacity,
    required this.available,
    required this.pricePerHour,
    required this.type,
    required this.zone,
    required this.hourlyDemand,
  });

  final String id;
  final String name;
  final String neighborhood;
  final double latitude;
  final double longitude;
  final int capacity;
  final int available;

  /// Price per hour in MKD.
  final double pricePerHour;
  final ParkingType type;

  /// Municipal parking zone (A, B, C...).
  final String zone;

  /// Expected demand (0..1) for each hour of the day (24 values),
  /// index 0 = 00:00.
  final List<double> hourlyDemand;

  LatLng get position => LatLng(latitude, longitude);

  double get occupancyRate =>
      capacity == 0 ? 1 : (capacity - available) / capacity;

  bool get isFull => available <= 0;

  ParkingSpot copyWith({int? available}) => ParkingSpot(
    id: id,
    name: name,
    neighborhood: neighborhood,
    latitude: latitude,
    longitude: longitude,
    capacity: capacity,
    available: available ?? this.available,
    pricePerHour: pricePerHour,
    type: type,
    zone: zone,
    hourlyDemand: hourlyDemand,
  );

  factory ParkingSpot.fromJson(Map<String, dynamic> json) => ParkingSpot(
    id: json['id'] as String,
    name: json['name'] as String,
    neighborhood: json['neighborhood'] as String,
    latitude: (json['latitude'] as num).toDouble(),
    longitude: (json['longitude'] as num).toDouble(),
    capacity: json['capacity'] as int,
    available: json['available'] as int,
    pricePerHour: (json['pricePerHour'] as num).toDouble(),
    type: ParkingType.values.byName(json['type'] as String),
    zone: json['zone'] as String,
    hourlyDemand: (json['hourlyDemand'] as List<dynamic>)
        .map((e) => (e as num).toDouble())
        .toList(growable: false),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'neighborhood': neighborhood,
    'latitude': latitude,
    'longitude': longitude,
    'capacity': capacity,
    'available': available,
    'pricePerHour': pricePerHour,
    'type': type.name,
    'zone': zone,
    'hourlyDemand': hourlyDemand,
  };
}
