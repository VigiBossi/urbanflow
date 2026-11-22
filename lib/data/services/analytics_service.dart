import '../models/city_report.dart';
import '../models/dashboard_data.dart';
import '../models/parking_spot.dart';
import 'insights_engine.dart';

/// Pure aggregation of raw data into [DashboardData].
class AnalyticsService {
  const AnalyticsService({
    this.insightsEngine = const InsightsEngine(),
    this.trendDays = 14,
  });

  final InsightsEngine insightsEngine;
  final int trendDays;

  DashboardData build({
    required List<CityReport> reports,
    required List<ParkingSpot> spots,
    required double revenueToday,
    required DateTime now,
  }) {
    final byCategory = {for (final c in ReportCategory.values) c: 0};
    for (final r in reports) {
      byCategory[r.category] = byCategory[r.category]! + 1;
    }

    final today = DateTime(now.year, now.month, now.day);
    final perDay = List.generate(trendDays, (i) {
      final day = today.subtract(Duration(days: trendDays - 1 - i));
      final next = day.add(const Duration(days: 1));
      final count = reports
          .where(
            (r) => !r.createdAt.isBefore(day) && r.createdAt.isBefore(next),
          )
          .length;
      return DailyCount(day: day, count: count);
    });

    final resolutionHours = reports
        .map((r) {
          final resolvedAt = r.resolvedAt;
          return resolvedAt?.difference(r.createdAt).inMinutes;
        })
        .whereType<int>()
        .map((m) => m / 60)
        .toList();

    final capacity = spots.fold<int>(0, (s, p) => s + p.capacity);
    final free = spots.fold<int>(0, (s, p) => s + p.available);

    final occupancyByHour = List.generate(24, (h) {
      if (spots.isEmpty) return 0.0;
      // Capacity-weighted expected occupancy.
      final weighted = spots.fold<double>(
        0,
        (s, p) => s + p.hourlyDemand[h] * p.capacity,
      );
      return capacity == 0 ? 0.0 : weighted / capacity * 100;
    });

    return DashboardData(
      openReports: reports.where((r) => r.isOpen).length,
      avgResolutionHours: resolutionHours.isEmpty
          ? null
          : resolutionHours.reduce((a, b) => a + b) / resolutionHours.length,
      parkingOccupancy: capacity == 0 ? 0 : (capacity - free) / capacity,
      revenueToday: revenueToday,
      reportsByCategory: byCategory,
      reportsPerDay: perDay,
      occupancyByHour: occupancyByHour,
      insights: insightsEngine.generate(
        reports: reports,
        spots: spots,
        now: now,
      ),
    );
  }
}
