import 'dart:math' as math;

import 'package:latlong2/latlong.dart';

import '../../core/utils/geo_utils.dart';
import '../models/app_user.dart';
import '../models/city_report.dart';
import '../models/parking_spot.dart';
import '../models/staff_member.dart';

/// A Skopje municipality / neighborhood with an approximate center.
class Neighborhood {
  const Neighborhood(this.name, this.center);

  final String name;
  final LatLng center;
}

/// Realistic simulated data for Skopje used by the mock backend.
abstract final class SkopjeData {
  static const List<Neighborhood> neighborhoods = [
    Neighborhood('Centar', LatLng(41.9961, 21.4316)),
    Neighborhood('Karpoš', LatLng(42.0045, 21.3935)),
    Neighborhood('Aerodrom', LatLng(41.9855, 21.4625)),
    Neighborhood('Čair', LatLng(42.0125, 21.4405)),
    Neighborhood('Gazi Baba', LatLng(42.0115, 21.4705)),
    Neighborhood('Kisela Voda', LatLng(41.9790, 21.4405)),
    Neighborhood('Butel', LatLng(42.0330, 21.4455)),
    Neighborhood('Gjorče Petrov', LatLng(42.0075, 21.3540)),
  ];

  /// Closest neighborhood name to [point].
  static String neighborhoodFor(LatLng point) {
    var best = neighborhoods.first;
    var bestDistance = double.infinity;
    for (final n in neighborhoods) {
      final d = GeoUtils.distanceMeters(point, n.center);
      if (d < bestDistance) {
        best = n;
        bestDistance = d;
      }
    }
    return best.name;
  }

  static const citizenUser = AppUser(
    id: 'u-citizen-1',
    name: 'Ana Petrovska',
    email: 'user@example.com',
    role: UserRole.citizen,
  );

  static const municipalityUser = AppUser(
    id: 'u-muni-1',
    name: 'Arben Rexhepi',
    email: 'municipality@urbanflow.ai',
    role: UserRole.municipality,
  );

  /// Demo passwords (mock backend only).
  static const Map<String, String> passwords = {
    'user@example.com': 'password123',
    'municipality@urbanflow.ai': 'password123',
  };

  static const List<StaffMember> staff = [
    StaffMember(
      id: 's1',
      name: 'Marko Stojanovski',
      department: Department.roads,
    ),
    StaffMember(
      id: 's2',
      name: 'Elena Trajkovska',
      department: Department.lighting,
    ),
    StaffMember(
      id: 's3',
      name: 'Besnik Ameti',
      department: Department.sanitation,
    ),
    StaffMember(
      id: 's4',
      name: 'Aylin Yildiz',
      department: Department.publicSpaces,
    ),
    StaffMember(id: 's5', name: 'Dragan Nikolov', department: Department.roads),
    StaffMember(
      id: 's6',
      name: 'Fatmire Selimi',
      department: Department.sanitation,
    ),
  ];

  // Typical demand curves (index = hour of day).
  static const List<double> _downtownDemand = [
    0.15, 0.1, 0.08, 0.08, 0.1, 0.15, 0.3, 0.55, 0.8, 0.9, 0.92, 0.9, //
    0.88, 0.85, 0.85, 0.82, 0.8, 0.85, 0.9, 0.88, 0.75, 0.55, 0.35, 0.2,
  ];
  static const List<double> _mallDemand = [
    0.05, 0.03, 0.02, 0.02, 0.02, 0.03, 0.05, 0.1, 0.2, 0.35, 0.5, 0.6, //
    0.65, 0.65, 0.65, 0.7, 0.8, 0.9, 0.95, 0.92, 0.8, 0.55, 0.25, 0.1,
  ];
  static const List<double> _residentialDemand = [
    0.85, 0.88, 0.9, 0.9, 0.88, 0.8, 0.65, 0.45, 0.35, 0.3, 0.3, 0.32, //
    0.35, 0.35, 0.4, 0.45, 0.55, 0.65, 0.75, 0.8, 0.85, 0.88, 0.9, 0.9,
  ];
  static const List<double> _hospitalDemand = [
    0.3, 0.25, 0.2, 0.2, 0.2, 0.3, 0.5, 0.8, 0.95, 0.95, 0.92, 0.9, //
    0.88, 0.85, 0.8, 0.7, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.3,
  ];
  static const List<double> _bazaarDemand = [
    0.1, 0.05, 0.05, 0.05, 0.05, 0.1, 0.2, 0.4, 0.6, 0.75, 0.85, 0.9, //
    0.9, 0.88, 0.85, 0.8, 0.75, 0.75, 0.8, 0.8, 0.7, 0.5, 0.3, 0.15,
  ];

  static List<ParkingSpot> parkingSpots() => const [
    ParkingSpot(
      id: 'p01',
      name: 'Plaza Macedonia Garage',
      neighborhood: 'Centar',
      latitude: 41.9958,
      longitude: 21.4337,
      capacity: 320,
      available: 41,
      pricePerHour: 60,
      type: ParkingType.garage,
      zone: 'A',
      hourlyDemand: _downtownDemand,
    ),
    ParkingSpot(
      id: 'p02',
      name: 'Macedonia Street Zone A',
      neighborhood: 'Centar',
      latitude: 41.9945,
      longitude: 21.4290,
      capacity: 60,
      available: 5,
      pricePerHour: 50,
      type: ParkingType.street,
      zone: 'A',
      hourlyDemand: _downtownDemand,
    ),
    ParkingSpot(
      id: 'p03',
      name: 'City Park Lot',
      neighborhood: 'Centar',
      latitude: 42.0037,
      longitude: 21.4175,
      capacity: 140,
      available: 58,
      pricePerHour: 40,
      type: ParkingType.lot,
      zone: 'B',
      hourlyDemand: _downtownDemand,
    ),
    ParkingSpot(
      id: 'p04',
      name: 'Debar Maalo Zone B',
      neighborhood: 'Centar',
      latitude: 41.9998,
      longitude: 21.4182,
      capacity: 85,
      available: 12,
      pricePerHour: 40,
      type: ParkingType.street,
      zone: 'B',
      hourlyDemand: _downtownDemand,
    ),
    ParkingSpot(
      id: 'p05',
      name: 'Ramstore Mall Parking',
      neighborhood: 'Centar',
      latitude: 41.9935,
      longitude: 21.4250,
      capacity: 450,
      available: 160,
      pricePerHour: 50,
      type: ParkingType.garage,
      zone: 'A',
      hourlyDemand: _mallDemand,
    ),
    ParkingSpot(
      id: 'p06',
      name: 'Vodno Cable Car Lot',
      neighborhood: 'Centar',
      latitude: 41.9805,
      longitude: 21.4170,
      capacity: 120,
      available: 74,
      pricePerHour: 30,
      type: ParkingType.lot,
      zone: 'C',
      hourlyDemand: _mallDemand,
    ),
    ParkingSpot(
      id: 'p07',
      name: 'Old Bazaar Parking',
      neighborhood: 'Čair',
      latitude: 42.0010,
      longitude: 21.4385,
      capacity: 200,
      available: 22,
      pricePerHour: 40,
      type: ParkingType.lot,
      zone: 'B',
      hourlyDemand: _bazaarDemand,
    ),
    ParkingSpot(
      id: 'p08',
      name: 'Bit Pazar Lot',
      neighborhood: 'Čair',
      latitude: 42.0040,
      longitude: 21.4440,
      capacity: 160,
      available: 9,
      pricePerHour: 30,
      type: ParkingType.lot,
      zone: 'B',
      hourlyDemand: _bazaarDemand,
    ),
    ParkingSpot(
      id: 'p09',
      name: 'Čair Square Street Parking',
      neighborhood: 'Čair',
      latitude: 42.0128,
      longitude: 21.4410,
      capacity: 55,
      available: 14,
      pricePerHour: 30,
      type: ParkingType.street,
      zone: 'C',
      hourlyDemand: _residentialDemand,
    ),
    ParkingSpot(
      id: 'p10',
      name: 'City Mall Garage',
      neighborhood: 'Karpoš',
      latitude: 42.0040,
      longitude: 21.3915,
      capacity: 900,
      available: 410,
      pricePerHour: 0,
      type: ParkingType.garage,
      zone: 'C',
      hourlyDemand: _mallDemand,
    ),
    ParkingSpot(
      id: 'p11',
      name: 'Clinical Center Lot',
      neighborhood: 'Karpoš',
      latitude: 41.9900,
      longitude: 21.4035,
      capacity: 260,
      available: 6,
      pricePerHour: 40,
      type: ParkingType.lot,
      zone: 'B',
      hourlyDemand: _hospitalDemand,
    ),
    ParkingSpot(
      id: 'p12',
      name: 'Karpoš 4 Zone C',
      neighborhood: 'Karpoš',
      latitude: 42.0055,
      longitude: 21.3990,
      capacity: 90,
      available: 27,
      pricePerHour: 20,
      type: ParkingType.street,
      zone: 'C',
      hourlyDemand: _residentialDemand,
    ),
    ParkingSpot(
      id: 'p13',
      name: 'Universal Hall Parking',
      neighborhood: 'Karpoš',
      latitude: 42.0005,
      longitude: 21.4085,
      capacity: 110,
      available: 66,
      pricePerHour: 30,
      type: ParkingType.lot,
      zone: 'B',
      hourlyDemand: _mallDemand,
    ),
    ParkingSpot(
      id: 'p14',
      name: 'Aerodrom Boulevard Parking',
      neighborhood: 'Aerodrom',
      latitude: 41.9860,
      longitude: 21.4590,
      capacity: 130,
      available: 39,
      pricePerHour: 20,
      type: ParkingType.street,
      zone: 'C',
      hourlyDemand: _residentialDemand,
    ),
    ParkingSpot(
      id: 'p15',
      name: 'Capitol Mall Garage',
      neighborhood: 'Aerodrom',
      latitude: 41.9875,
      longitude: 21.4515,
      capacity: 600,
      available: 250,
      pricePerHour: 0,
      type: ParkingType.garage,
      zone: 'C',
      hourlyDemand: _mallDemand,
    ),
    ParkingSpot(
      id: 'p16',
      name: 'Jane Sandanski Lot',
      neighborhood: 'Aerodrom',
      latitude: 41.9830,
      longitude: 21.4700,
      capacity: 95,
      available: 31,
      pricePerHour: 20,
      type: ParkingType.lot,
      zone: 'C',
      hourlyDemand: _residentialDemand,
    ),
    ParkingSpot(
      id: 'p17',
      name: 'East Gate Mall Parking',
      neighborhood: 'Gazi Baba',
      latitude: 41.9940,
      longitude: 21.4830,
      capacity: 1200,
      available: 690,
      pricePerHour: 0,
      type: ParkingType.garage,
      zone: 'C',
      hourlyDemand: _mallDemand,
    ),
    ParkingSpot(
      id: 'p18',
      name: 'Gazi Baba Park Lot',
      neighborhood: 'Gazi Baba',
      latitude: 42.0090,
      longitude: 21.4620,
      capacity: 70,
      available: 30,
      pricePerHour: 20,
      type: ParkingType.lot,
      zone: 'C',
      hourlyDemand: _residentialDemand,
    ),
    ParkingSpot(
      id: 'p19',
      name: 'Transport Center Parking',
      neighborhood: 'Centar',
      latitude: 41.9910,
      longitude: 21.4460,
      capacity: 240,
      available: 88,
      pricePerHour: 40,
      type: ParkingType.lot,
      zone: 'B',
      hourlyDemand: _downtownDemand,
    ),
    ParkingSpot(
      id: 'p20',
      name: 'Kisela Voda Market Zone',
      neighborhood: 'Kisela Voda',
      latitude: 41.9785,
      longitude: 21.4420,
      capacity: 75,
      available: 0,
      pricePerHour: 20,
      type: ParkingType.street,
      zone: 'C',
      hourlyDemand: _bazaarDemand,
    ),
    ParkingSpot(
      id: 'p21',
      name: 'Philharmonic Garage',
      neighborhood: 'Centar',
      latitude: 41.9975,
      longitude: 21.4365,
      capacity: 180,
      available: 23,
      pricePerHour: 60,
      type: ParkingType.garage,
      zone: 'A',
      hourlyDemand: _downtownDemand,
    ),
    ParkingSpot(
      id: 'p22',
      name: 'Butel Municipality Lot',
      neighborhood: 'Butel',
      latitude: 42.0315,
      longitude: 21.4450,
      capacity: 80,
      available: 46,
      pricePerHour: 20,
      type: ParkingType.lot,
      zone: 'C',
      hourlyDemand: _residentialDemand,
    ),
  ];

  static const Map<ReportCategory, List<String>> _descriptions = {
    ReportCategory.pothole: [
      'Deep pothole in the right lane, cars swerving to avoid it.',
      'Several potholes after the rain, dangerous for scooters.',
      'Asphalt broken near the pedestrian crossing.',
    ],
    ReportCategory.streetlight: [
      'Street light has been off for three nights.',
      'Light flickers constantly near the bus stop.',
      'Whole street is dark after 21:00.',
    ],
    ReportCategory.graffiti: [
      'Graffiti on the school wall facing the playground.',
      'Offensive graffiti on the underpass.',
    ],
    ReportCategory.trash: [
      'Overflowing containers, not collected for days.',
      'Illegal dumping of construction waste by the river.',
      'Broken bin next to the park entrance.',
    ],
    ReportCategory.damagedSign: [
      'Stop sign bent and barely visible.',
      'Street name sign missing at the intersection.',
    ],
    ReportCategory.other: [
      'Fallen tree branch blocking the sidewalk.',
      'Water leak from a pipe on the pavement.',
    ],
  };

  /// Deterministic seed reports covering the last three weeks.
  ///
  /// Contains a deliberate spike of potholes in Aerodrom this week (+40%
  /// versus last week) so the dashboard insights have something to show.
  static List<CityReport> seedReports(DateTime now) {
    final random = math.Random(2026);
    final reports = <CityReport>[];
    var counter = 0;

    CityReport make({
      required ReportCategory category,
      required Neighborhood area,
      required DateTime createdAt,
      String reporterId = 'u-other',
      ReportStatus? status,
      ReportPriority? priority,
    }) {
      counter++;
      final ageHours = now.difference(createdAt).inHours;
      final resolvedStatus =
          status ??
          (ageHours > 24 * 10
              ? (random.nextDouble() < 0.75
                    ? ReportStatus.resolved
                    : ReportStatus.inProgress)
              : ReportStatus.values[random.nextInt(
                  ReportStatus.values.length,
                )]);
      final history = <StatusChange>[
        StatusChange(status: ReportStatus.submitted, changedAt: createdAt),
      ];
      var t = createdAt;
      for (final s in ReportStatus.values.skip(1)) {
        if (s.index > resolvedStatus.index) break;
        t = t.add(Duration(hours: 4 + random.nextInt(40)));
        if (t.isAfter(now)) t = now;
        history.add(StatusChange(status: s, changedAt: t));
      }
      final texts = _descriptions[category]!;
      final assigned =
          resolvedStatus.index >= ReportStatus.inProgress.index ||
              random.nextBool()
          ? staff[random.nextInt(staff.length)].id
          : null;
      return CityReport(
        id: 'r${counter.toString().padLeft(3, '0')}',
        reporterId: reporterId,
        category: category,
        description: texts[random.nextInt(texts.length)],
        latitude: area.center.latitude + (random.nextDouble() - 0.5) * 0.014,
        longitude: area.center.longitude + (random.nextDouble() - 0.5) * 0.018,
        neighborhood: area.name,
        status: resolvedStatus,
        priority:
            priority ??
            ReportPriority.values[random.nextInt(ReportPriority.values.length)],
        createdAt: createdAt,
        updatedAt: history.last.changedAt,
        hasPhoto: random.nextBool(),
        assignedStaffId: assigned,
        history: history,
      );
    }

    // Background noise: random reports over 21 days, excluding the
    // Aerodrom pothole combination which is seeded explicitly below.
    while (reports.length < 52) {
      final category =
          ReportCategory.values[random.nextInt(ReportCategory.values.length)];
      final area = neighborhoods[random.nextInt(neighborhoods.length)];
      if (category == ReportCategory.pothole && area.name == 'Aerodrom') {
        continue;
      }
      final created = now.subtract(
        Duration(hours: 2 + random.nextInt(24 * 21)),
      );
      reports.add(make(category: category, area: area, createdAt: created));
    }

    final aerodrom = neighborhoods.firstWhere((n) => n.name == 'Aerodrom');
    // Last week: 5 potholes.
    for (var i = 0; i < 5; i++) {
      reports.add(
        make(
          category: ReportCategory.pothole,
          area: aerodrom,
          createdAt: now.subtract(Duration(days: 8 + i, hours: 3)),
        ),
      );
    }
    // This week: 7 potholes.
    for (var i = 0; i < 7; i++) {
      reports.add(
        make(
          category: ReportCategory.pothole,
          area: aerodrom,
          createdAt: now.subtract(Duration(days: i % 6, hours: 2 + i)),
          status: i < 4 ? ReportStatus.submitted : ReportStatus.inReview,
          priority: i == 0 ? ReportPriority.critical : ReportPriority.high,
        ),
      );
    }

    // The demo citizen's own reports.
    final centar = neighborhoods.first;
    final karpos = neighborhoods[1];
    reports.addAll([
      make(
        category: ReportCategory.streetlight,
        area: centar,
        createdAt: now.subtract(const Duration(days: 1, hours: 4)),
        reporterId: citizenUser.id,
        status: ReportStatus.submitted,
        priority: ReportPriority.medium,
      ),
      make(
        category: ReportCategory.pothole,
        area: karpos,
        createdAt: now.subtract(const Duration(days: 4)),
        reporterId: citizenUser.id,
        status: ReportStatus.inProgress,
        priority: ReportPriority.high,
      ),
      make(
        category: ReportCategory.trash,
        area: centar,
        createdAt: now.subtract(const Duration(days: 12)),
        reporterId: citizenUser.id,
        status: ReportStatus.resolved,
        priority: ReportPriority.low,
      ),
    ]);

    reports.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return reports;
  }
}
