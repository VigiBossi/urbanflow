import 'dart:math' as math;

import 'package:fl_chart/fl_chart.dart';
import 'package:material_ui/material_ui.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/utils/enum_labels.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../data/models/city_report.dart';
import '../../../data/models/dashboard_data.dart';

/// Pie chart of report counts per category, with a legend.
class CategoryPieChart extends StatelessWidget {
  const CategoryPieChart({super.key, required this.data});

  final Map<ReportCategory, int> data;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final total = data.values.fold<int>(0, (a, b) => a + b);
    final entries = data.entries.where((e) => e.value > 0).toList();
    return Row(
      children: [
        Expanded(
          child: PieChart(
            PieChartData(
              sectionsSpace: 2,
              centerSpaceRadius: 36,
              sections: [
                for (final e in entries)
                  PieChartSectionData(
                    value: e.value.toDouble(),
                    color: e.key.color,
                    radius: 52,
                    title: total == 0
                        ? ''
                        : '${(e.value / total * 100).round()}%',
                    titleStyle: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 11,
                    ),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(width: Spacing.md),
        Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            for (final e in entries)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.square_rounded, size: 12, color: e.key.color),
                    const SizedBox(width: Spacing.xs),
                    ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 130),
                      child: Text(
                        '${e.key.label(l10n)} (${e.value})',
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.labelSmall,
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ],
    );
  }
}

/// Line chart of reports per day.
class ReportsLineChart extends StatelessWidget {
  const ReportsLineChart({super.key, required this.data});

  final List<DailyCount> data;

  @override
  Widget build(BuildContext context) {
    final fmt = Formatters(context.l10n);
    final scheme = Theme.of(context).colorScheme;
    final maxY = data.fold<int>(0, (m, d) => math.max(m, d.count));
    final labelStyle = Theme.of(context).textTheme.labelSmall;
    return LineChart(
      LineChartData(
        minY: 0,
        maxY: (maxY + 2).toDouble(),
        gridData: FlGridData(
          drawVerticalLine: false,
          getDrawingHorizontalLine: (_) =>
              FlLine(color: scheme.outlineVariant, strokeWidth: 0.5),
        ),
        borderData: FlBorderData(show: false),
        titlesData: FlTitlesData(
          topTitles: const AxisTitles(),
          rightTitles: const AxisTitles(),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 28,
              interval: math.max(1, (maxY / 4).ceilToDouble()),
              getTitlesWidget: (value, meta) => SideTitleWidget(
                meta: meta,
                child: Text(value.toInt().toString(), style: labelStyle),
              ),
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 24,
              interval: 1,
              getTitlesWidget: (value, meta) {
                final i = value.toInt();
                // Label every third day, anchored on today (last point).
                if (i < 0 ||
                    i >= data.length ||
                    (data.length - 1 - i) % 3 != 0) {
                  return const SizedBox.shrink();
                }
                return SideTitleWidget(
                  meta: meta,
                  child: Text(fmt.shortDay(data[i].day), style: labelStyle),
                );
              },
            ),
          ),
        ),
        lineBarsData: [
          LineChartBarData(
            isCurved: true,
            preventCurveOverShooting: true,
            color: scheme.primary,
            barWidth: 3,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              color: scheme.primary.withValues(alpha: 0.15),
            ),
            spots: [
              for (var i = 0; i < data.length; i++)
                FlSpot(i.toDouble(), data[i].count.toDouble()),
            ],
          ),
        ],
      ),
    );
  }
}

/// Bar chart of expected occupancy (%) per hour.
class OccupancyBarChart extends StatelessWidget {
  const OccupancyBarChart({super.key, required this.data, required this.now});

  final List<double> data;
  final DateTime now;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final labelStyle = Theme.of(context).textTheme.labelSmall;
    return BarChart(
      BarChartData(
        maxY: 100,
        gridData: FlGridData(
          drawVerticalLine: false,
          horizontalInterval: 25,
          getDrawingHorizontalLine: (_) =>
              FlLine(color: scheme.outlineVariant, strokeWidth: 0.5),
        ),
        borderData: FlBorderData(show: false),
        titlesData: FlTitlesData(
          topTitles: const AxisTitles(),
          rightTitles: const AxisTitles(),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 32,
              interval: 25,
              getTitlesWidget: (value, meta) => SideTitleWidget(
                meta: meta,
                child: Text('${value.toInt()}', style: labelStyle),
              ),
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 22,
              getTitlesWidget: (value, meta) {
                final h = value.toInt();
                if (h % 3 != 0) return const SizedBox.shrink();
                return SideTitleWidget(
                  meta: meta,
                  child: Text(h.toString().padLeft(2, '0'), style: labelStyle),
                );
              },
            ),
          ),
        ),
        barGroups: [
          for (var h = 0; h < data.length; h++)
            BarChartGroupData(
              x: h,
              barRods: [
                BarChartRodData(
                  toY: data[h],
                  width: 7,
                  borderRadius: BorderRadius.circular(3),
                  color: h == now.hour ? scheme.tertiary : scheme.primary,
                ),
              ],
            ),
        ],
      ),
    );
  }
}
