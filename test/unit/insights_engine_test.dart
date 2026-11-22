import 'package:flutter_test/flutter_test.dart';
import 'package:urbanflow_ai/data/mock/skopje_data.dart';
import 'package:urbanflow_ai/data/models/city_report.dart';
import 'package:urbanflow_ai/data/models/insight.dart';
import 'package:urbanflow_ai/data/services/analytics_service.dart';
import 'package:urbanflow_ai/data/services/insights_engine.dart';

void main() {
  final now = DateTime(2026, 5, 20, 12);
  final reports = SkopjeData.seedReports(now);
  final spots = SkopjeData.parkingSpots();

  test('detects the +40% pothole spike in Aerodrom', () {
    final insights = const InsightsEngine().generate(
      reports: reports,
      spots: spots,
      now: now,
    );
    final spike = insights.firstWhere(
      (i) =>
          i.type == InsightType.categorySpike &&
          i.neighborhood == 'Aerodrom' &&
          i.category == ReportCategory.pothole,
    );
    expect(spike.percent, 40);
    expect(spike.count, 7);
  });

  test('insights are capped and sorted by severity', () {
    final insights = const InsightsEngine(maxInsights: 4)
        .generate(reports: reports, spots: spots, now: now);
    expect(insights.length, lessThanOrEqualTo(4));
    for (var i = 1; i < insights.length; i++) {
      expect(
        insights[i - 1].severity.index,
        greaterThanOrEqualTo(insights[i].severity.index),
      );
    }
  });

  test('analytics aggregates KPIs and chart series', () {
    final data = const AnalyticsService().build(
      reports: reports,
      spots: spots,
      revenueToday: 1000,
      now: now,
    );
    expect(data.openReports, reports.where((r) => r.isOpen).length);
    expect(
      data.reportsByCategory.values.reduce((a, b) => a + b),
      reports.length,
    );
    expect(data.reportsPerDay, hasLength(14));
    expect(data.occupancyByHour, hasLength(24));
    expect(data.parkingOccupancy, inInclusiveRange(0, 1));
    expect(data.avgResolutionHours, isNotNull);
  });
}
