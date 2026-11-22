import 'city_report.dart';

enum InsightType {
  categorySpike,
  categoryDrop,
  hotspot,
  unassignedCritical,
  slowResolution,
  peakOccupancy,
  fullParking,
}

enum InsightSeverity { info, positive, warning, critical }

/// A rule-based insight derived from city data. Text is produced by the UI
/// from these structured fields so it can be localized.
class Insight {
  const Insight({
    required this.type,
    required this.severity,
    this.category,
    this.neighborhood,
    this.percent,
    this.count,
    this.hour,
    this.days,
  });

  final InsightType type;
  final InsightSeverity severity;
  final ReportCategory? category;
  final String? neighborhood;
  final int? percent;
  final int? count;
  final int? hour;
  final double? days;

  factory Insight.fromJson(Map<String, dynamic> json) => Insight(
    type: InsightType.values.byName(json['type'] as String),
    severity: InsightSeverity.values.byName(json['severity'] as String),
    category: json['category'] == null
        ? null
        : ReportCategory.values.byName(json['category'] as String),
    neighborhood: json['neighborhood'] as String?,
    percent: json['percent'] as int?,
    count: json['count'] as int?,
    hour: json['hour'] as int?,
    days: (json['days'] as num?)?.toDouble(),
  );

  Map<String, dynamic> toJson() => {
    'type': type.name,
    'severity': severity.name,
    'category': category?.name,
    'neighborhood': neighborhood,
    'percent': percent,
    'count': count,
    'hour': hour,
    'days': days,
  };
}
