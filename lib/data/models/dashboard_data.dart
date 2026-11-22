import 'city_report.dart';
import 'insight.dart';

/// Aggregated metrics shown on the municipality dashboard.
class DashboardData {
  const DashboardData({
    required this.openReports,
    required this.avgResolutionHours,
    required this.parkingOccupancy,
    required this.revenueToday,
    required this.reportsByCategory,
    required this.reportsPerDay,
    required this.occupancyByHour,
    required this.insights,
  });

  final int openReports;

  /// Average time to resolve a report, in hours (null when none resolved).
  final double? avgResolutionHours;

  /// Current city-wide occupancy (0..1).
  final double parkingOccupancy;

  /// Parking revenue today in MKD.
  final double revenueToday;

  final Map<ReportCategory, int> reportsByCategory;

  /// Report counts for each of the last N days, oldest first.
  final List<DailyCount> reportsPerDay;

  /// Expected occupancy percentage (0..100) for each hour of the day.
  final List<double> occupancyByHour;

  final List<Insight> insights;

  factory DashboardData.fromJson(Map<String, dynamic> json) => DashboardData(
    openReports: json['openReports'] as int,
    avgResolutionHours: (json['avgResolutionHours'] as num?)?.toDouble(),
    parkingOccupancy: (json['parkingOccupancy'] as num).toDouble(),
    revenueToday: (json['revenueToday'] as num).toDouble(),
    reportsByCategory: (json['reportsByCategory'] as Map<String, dynamic>).map(
      (k, v) => MapEntry(ReportCategory.values.byName(k), v as int),
    ),
    reportsPerDay: (json['reportsPerDay'] as List<dynamic>)
        .map((e) => DailyCount.fromJson(e as Map<String, dynamic>))
        .toList(),
    occupancyByHour: (json['occupancyByHour'] as List<dynamic>)
        .map((e) => (e as num).toDouble())
        .toList(),
    insights: (json['insights'] as List<dynamic>)
        .map((e) => Insight.fromJson(e as Map<String, dynamic>))
        .toList(),
  );

  Map<String, dynamic> toJson() => {
    'openReports': openReports,
    'avgResolutionHours': avgResolutionHours,
    'parkingOccupancy': parkingOccupancy,
    'revenueToday': revenueToday,
    'reportsByCategory': reportsByCategory.map((k, v) => MapEntry(k.name, v)),
    'reportsPerDay': reportsPerDay.map((d) => d.toJson()).toList(),
    'occupancyByHour': occupancyByHour,
    'insights': insights.map((i) => i.toJson()).toList(),
  };
}

class DailyCount {
  const DailyCount({required this.day, required this.count});

  final DateTime day;
  final int count;

  factory DailyCount.fromJson(Map<String, dynamic> json) => DailyCount(
    day: DateTime.parse(json['day'] as String),
    count: json['count'] as int,
  );

  Map<String, dynamic> toJson() => {
    'day': day.toIso8601String(),
    'count': count,
  };
}
