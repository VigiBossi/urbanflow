import '../models/city_report.dart';
import '../models/insight.dart';
import '../models/parking_spot.dart';

/// Generates rule-based "AI insights" from reports and parking data.
class InsightsEngine {
  const InsightsEngine({
    this.spikeThreshold = 0.3,
    this.minBaseline = 3,
    this.slowResolutionDays = 3,
    this.maxInsights = 6,
  });

  /// Minimum week-over-week growth to flag a spike (0.3 = +30%).
  final double spikeThreshold;

  /// Minimum reports in the previous week before a change is meaningful.
  final int minBaseline;

  final double slowResolutionDays;
  final int maxInsights;

  List<Insight> generate({
    required List<CityReport> reports,
    required List<ParkingSpot> spots,
    required DateTime now,
  }) {
    final insights = <Insight>[
      ..._weekOverWeek(reports, now),
      ..._unassignedCritical(reports),
      ..._hotspot(reports),
      ..._slowResolution(reports),
      ..._parking(spots),
    ];
    insights.sort((a, b) => b.severity.index.compareTo(a.severity.index));
    return insights.take(maxInsights).toList();
  }

  List<Insight> _weekOverWeek(List<CityReport> reports, DateTime now) {
    final weekAgo = now.subtract(const Duration(days: 7));
    final twoWeeksAgo = now.subtract(const Duration(days: 14));
    final thisWeek = <(String, ReportCategory), int>{};
    final lastWeek = <(String, ReportCategory), int>{};
    final catThisWeek = <ReportCategory, int>{};
    final catLastWeek = <ReportCategory, int>{};

    for (final r in reports) {
      final key = (r.neighborhood, r.category);
      if (r.createdAt.isAfter(weekAgo)) {
        thisWeek[key] = (thisWeek[key] ?? 0) + 1;
        catThisWeek[r.category] = (catThisWeek[r.category] ?? 0) + 1;
      } else if (r.createdAt.isAfter(twoWeeksAgo)) {
        lastWeek[key] = (lastWeek[key] ?? 0) + 1;
        catLastWeek[r.category] = (catLastWeek[r.category] ?? 0) + 1;
      }
    }

    final spikes = <Insight>[];
    lastWeek.forEach((key, previous) {
      if (previous < minBaseline) return;
      final current = thisWeek[key] ?? 0;
      final change = (current - previous) / previous;
      if (change >= spikeThreshold) {
        spikes.add(
          Insight(
            type: InsightType.categorySpike,
            severity: change >= 0.75
                ? InsightSeverity.critical
                : InsightSeverity.warning,
            neighborhood: key.$1,
            category: key.$2,
            percent: (change * 100).round(),
            count: current,
          ),
        );
      }
    });
    spikes.sort((a, b) => b.percent!.compareTo(a.percent!));

    final drops = <Insight>[];
    catLastWeek.forEach((category, previous) {
      if (previous < minBaseline + 1) return;
      final current = catThisWeek[category] ?? 0;
      final change = (current - previous) / previous;
      if (change <= -spikeThreshold) {
        drops.add(
          Insight(
            type: InsightType.categoryDrop,
            severity: InsightSeverity.positive,
            category: category,
            percent: (change.abs() * 100).round(),
          ),
        );
      }
    });
    drops.sort((a, b) => b.percent!.compareTo(a.percent!));
    return [...spikes.take(2), ...drops.take(1)];
  }

  List<Insight> _unassignedCritical(List<CityReport> reports) {
    final count = reports
        .where(
          (r) =>
              r.isOpen &&
              r.assignedStaffId == null &&
              r.priority.index >= ReportPriority.high.index,
        )
        .length;
    if (count == 0) return const [];
    return [
      Insight(
        type: InsightType.unassignedCritical,
        severity: InsightSeverity.critical,
        count: count,
      ),
    ];
  }

  List<Insight> _hotspot(List<CityReport> reports) {
    final open = <String, int>{};
    for (final r in reports.where((r) => r.isOpen)) {
      open[r.neighborhood] = (open[r.neighborhood] ?? 0) + 1;
    }
    if (open.isEmpty) return const [];
    final top = open.entries.reduce((a, b) => a.value >= b.value ? a : b);
    return [
      Insight(
        type: InsightType.hotspot,
        severity: InsightSeverity.info,
        neighborhood: top.key,
        count: top.value,
      ),
    ];
  }

  List<Insight> _slowResolution(List<CityReport> reports) {
    final totals = <ReportCategory, (double, int)>{};
    for (final r in reports) {
      final resolvedAt = r.resolvedAt;
      if (resolvedAt == null) continue;
      final days = resolvedAt.difference(r.createdAt).inMinutes / (60 * 24);
      final current = totals[r.category] ?? (0.0, 0);
      totals[r.category] = (current.$1 + days, current.$2 + 1);
    }
    if (totals.isEmpty) return const [];
    final averages = totals.map((k, v) => MapEntry(k, v.$1 / v.$2));
    final slowest = averages.entries.reduce(
      (a, b) => a.value >= b.value ? a : b,
    );
    if (slowest.value < slowResolutionDays) return const [];
    return [
      Insight(
        type: InsightType.slowResolution,
        severity: InsightSeverity.warning,
        category: slowest.key,
        days: double.parse(slowest.value.toStringAsFixed(1)),
      ),
    ];
  }

  List<Insight> _parking(List<ParkingSpot> spots) {
    if (spots.isEmpty) return const [];
    final insights = <Insight>[];
    var peakHour = 0;
    var peakValue = -1.0;
    for (var h = 0; h < 24; h++) {
      final avg =
          spots.fold<double>(0, (s, p) => s + p.hourlyDemand[h]) / spots.length;
      if (avg > peakValue) {
        peakValue = avg;
        peakHour = h;
      }
    }
    insights.add(
      Insight(
        type: InsightType.peakOccupancy,
        severity: InsightSeverity.info,
        hour: peakHour,
        percent: (peakValue * 100).round(),
      ),
    );
    final nearlyFull = spots.where((s) => s.occupancyRate >= 0.9).length;
    if (nearlyFull > 0) {
      insights.add(
        Insight(
          type: InsightType.fullParking,
          severity: InsightSeverity.warning,
          count: nearlyFull,
        ),
      );
    }
    return insights;
  }
}
