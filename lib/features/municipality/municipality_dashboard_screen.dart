import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:provider/provider.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../core/models/report_model.dart';
import '../../core/providers/municipality_provider.dart';
import '../../core/providers/reports_provider.dart';
import '../../shared/widgets/status_badge.dart';

class MunicipalityDashboardScreen extends StatefulWidget {
  const MunicipalityDashboardScreen({super.key});

  @override
  State<MunicipalityDashboardScreen> createState() =>
      _MunicipalityDashboardScreenState();
}

class _MunicipalityDashboardScreenState
    extends State<MunicipalityDashboardScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final reports = context.watch<ReportsProvider>();
    final muni = context.watch<MunicipalityProvider>();
    final analytics = muni.getAnalyticsSummary(reports.allReports.toList());

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.dashboard),
        backgroundColor: const Color(0xFF4A148C),
        foregroundColor: Colors.white,
        elevation: 0,
        bottom: TabBar(
          controller: _tabCtrl,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          labelStyle: const TextStyle(
              fontSize: 12, fontWeight: FontWeight.w600),
          tabs: const [
            Tab(text: 'Overview'),
            Tab(text: 'Reports'),
            Tab(text: 'Analytics'),
          ],
        ),
      ),
      backgroundColor: const Color(0xFFF5F7FF),
      body: TabBarView(
        controller: _tabCtrl,
        children: [
          _OverviewTab(analytics: analytics, l10n: l10n),
          _ReportsManagementTab(reports: reports, muni: muni, l10n: l10n),
          _AnalyticsTab(analytics: analytics, reports: reports, l10n: l10n),
        ],
      ),
    );
  }
}

class _OverviewTab extends StatelessWidget {
  final Map<String, dynamic> analytics;
  final AppLocalizations l10n;

  const _OverviewTab({required this.analytics, required this.l10n});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _StatCardsGrid(analytics: analytics, l10n: l10n),
          const SizedBox(height: 20),
          _AiInsightsCard(insights: analytics['insights'] as List<String>),
          const SizedBox(height: 20),
          _PriorityReportsList(l10n: l10n),
        ],
      ),
    );
  }
}

class _StatCardsGrid extends StatelessWidget {
  final Map<String, dynamic> analytics;
  final AppLocalizations l10n;

  const _StatCardsGrid({required this.analytics, required this.l10n});

  @override
  Widget build(BuildContext context) {
    final cards = [
      (
        l10n.totalReports,
        '${analytics['total']}',
        Icons.assessment_outlined,
        const Color(0xFF1565C0),
        const [Color(0xFF1565C0), Color(0xFF1E88E5)],
      ),
      (
        l10n.pending,
        '${analytics['pending']}',
        Icons.schedule,
        const Color(0xFFF57F17),
        const [Color(0xFFF57F17), Color(0xFFFBC02D)],
      ),
      (
        l10n.inProgress,
        '${analytics['inProgress']}',
        Icons.autorenew,
        const Color(0xFF0277BD),
        const [Color(0xFF0277BD), Color(0xFF0288D1)],
      ),
      (
        '${l10n.resolvedRate}',
        '${(analytics['resolutionRate'] as double).round()}%',
        Icons.check_circle_outline,
        const Color(0xFF2E7D32),
        const [Color(0xFF2E7D32), Color(0xFF43A047)],
      ),
    ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: cards.map((c) => _StatCard(
            label: c.$1,
            value: c.$2,
            icon: c.$3,
            color: c.$4,
            gradient: c.$5,
          )).toList(),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final List<Color> gradient;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    required this.gradient,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
            colors: gradient,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: color.withOpacity(0.3),
              blurRadius: 10,
              offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: Colors.white.withOpacity(0.9), size: 24),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold)),
              Text(label,
                  style: TextStyle(
                      color: Colors.white.withOpacity(0.85),
                      fontSize: 11),
                  overflow: TextOverflow.ellipsis),
            ],
          ),
        ],
      ),
    );
  }
}

class _AiInsightsCard extends StatelessWidget {
  final List<String> insights;
  const _AiInsightsCard({required this.insights});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1A237E), Color(0xFF283593)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.auto_awesome, color: Colors.amber, size: 20),
              SizedBox(width: 8),
              Text('AI Insights',
                  style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16)),
            ],
          ),
          const SizedBox(height: 12),
          ...insights.map((insight) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Padding(
                      padding: EdgeInsets.only(top: 4),
                      child: Icon(Icons.arrow_right,
                          color: Colors.amber, size: 16),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(insight,
                          style: TextStyle(
                              color: Colors.white.withOpacity(0.9),
                              fontSize: 12,
                              height: 1.4)),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }
}

class _PriorityReportsList extends StatelessWidget {
  final AppLocalizations l10n;
  const _PriorityReportsList({required this.l10n});

  @override
  Widget build(BuildContext context) {
    final reports = context.watch<ReportsProvider>();
    final priority = reports.priorityReports.take(5).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(l10n.priorityIssues,
            style: const TextStyle(
                fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        if (priority.isEmpty)
          const Center(
              child: Text('No priority issues',
                  style: TextStyle(color: Colors.grey)))
        else
          ...priority.map((r) => _PriorityReportCard(report: r, l10n: l10n)),
      ],
    );
  }
}

class _PriorityReportCard extends StatelessWidget {
  final Report report;
  final AppLocalizations l10n;

  const _PriorityReportCard({required this.report, required this.l10n});

  @override
  Widget build(BuildContext context) {
    final muni = context.read<MunicipalityProvider>();
    final reports = context.read<ReportsProvider>();

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2)),
        ],
        border: Border(
          left: BorderSide(
            color: report.priorityScore >= 70
                ? AppColors.error
                : AppColors.warning,
            width: 4,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(report.categoryIcon,
                  color: report.statusColor, size: 18),
              const SizedBox(width: 8),
              Expanded(
                child: Text(report.title,
                    style: const TextStyle(
                        fontWeight: FontWeight.w700, fontSize: 13),
                    overflow: TextOverflow.ellipsis),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: report.priorityScore >= 70
                      ? AppColors.error.withOpacity(0.1)
                      : AppColors.warning.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text('P${report.priorityScore}',
                    style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: report.priorityScore >= 70
                            ? AppColors.error
                            : AppColors.warning)),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              StatusBadge.reportStatus(report.status),
              const SizedBox(width: 8),
              Text(timeago.format(report.createdAt),
                  style: TextStyle(
                      fontSize: 11, color: Colors.grey[500])),
              const Spacer(),
              Text('${report.upvotes} votes',
                  style: TextStyle(
                      fontSize: 11, color: Colors.grey[500])),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<ReportStatus>(
                  value: report.status,
                  isDense: true,
                  decoration: InputDecoration(
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 8),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide:
                            BorderSide(color: Colors.grey[300]!)),
                    enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide:
                            BorderSide(color: Colors.grey[300]!)),
                  ),
                  items: ReportStatus.values
                      .map((s) => DropdownMenuItem(
                            value: s,
                            child: Text(
                              s == ReportStatus.inProgress
                                  ? 'In Progress'
                                  : '${s.name[0].toUpperCase()}${s.name.substring(1)}',
                              style: const TextStyle(fontSize: 12),
                            ),
                          ))
                      .toList(),
                  onChanged: (s) {
                    if (s == null) return;
                    reports.updateReportStatus(
                        reportId: report.id, status: s);
                  },
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: () => _showAssignDialog(context, report,
                    muni, reports),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4A148C),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 8),
                ),
                child: const Text('Assign',
                    style: TextStyle(
                        fontSize: 12, color: Colors.white)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showAssignDialog(BuildContext context, Report report,
      MunicipalityProvider muni, ReportsProvider reports) {
    showDialog(
      context: context,
      builder: (ctx) {
        String? selectedStaff = report.assignedTo;
        String noteText = report.municipalityNote ?? '';

        return StatefulBuilder(builder: (ctx, setState) {
          return AlertDialog(
            title: const Text('Assign & Update Report'),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16)),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  value: selectedStaff,
                  hint: const Text('Select staff / unit'),
                  decoration: const InputDecoration(
                    labelText: 'Assign To',
                    border: OutlineInputBorder(),
                  ),
                  items: muni.staffList
                      .map((s) => DropdownMenuItem(
                            value: s,
                            child: Text(s,
                                style:
                                    const TextStyle(fontSize: 13)),
                          ))
                      .toList(),
                  onChanged: (v) =>
                      setState(() => selectedStaff = v),
                ),
                const SizedBox(height: 14),
                TextField(
                  maxLines: 3,
                  controller:
                      TextEditingController(text: noteText),
                  onChanged: (v) => noteText = v,
                  decoration: const InputDecoration(
                    labelText: 'Official Note (optional)',
                    border: OutlineInputBorder(),
                    hintText:
                        'Add a note visible to the citizen...',
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () {
                  if (selectedStaff != null) {
                    reports.updateReportStatus(
                      reportId: report.id,
                      status: ReportStatus.inProgress,
                      assignedTo: selectedStaff,
                      municipalityNote:
                          noteText.isNotEmpty ? noteText : null,
                    );
                  }
                  Navigator.pop(ctx);
                },
                style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary),
                child: const Text('Confirm',
                    style: TextStyle(color: Colors.white)),
              ),
            ],
          );
        });
      },
    );
  }
}

class _ReportsManagementTab extends StatelessWidget {
  final ReportsProvider reports;
  final MunicipalityProvider muni;
  final AppLocalizations l10n;

  const _ReportsManagementTab({
    required this.reports,
    required this.muni,
    required this.l10n,
  });

  @override
  Widget build(BuildContext context) {
    final all = reports.allReports.toList()
      ..sort((a, b) => b.priorityScore.compareTo(a.priorityScore));

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: all.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (ctx, i) => _MuniReportCard(report: all[i], l10n: l10n),
    );
  }
}

class _MuniReportCard extends StatelessWidget {
  final Report report;
  final AppLocalizations l10n;

  const _MuniReportCard({required this.report, required this.l10n});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 6,
              offset: const Offset(0, 2)),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: report.statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(report.categoryIcon,
                color: report.statusColor, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(report.title,
                    style: const TextStyle(
                        fontWeight: FontWeight.w700, fontSize: 13),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                Text(
                  '${report.userName} • ${timeago.format(report.createdAt)}',
                  style: TextStyle(
                      fontSize: 11, color: Colors.grey[500]),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              StatusBadge.reportStatus(report.status),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: report.priorityScore >= 70
                      ? AppColors.error.withOpacity(0.1)
                      : Colors.grey[100],
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text('P${report.priorityScore}',
                    style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: report.priorityScore >= 70
                            ? AppColors.error
                            : Colors.grey)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _AnalyticsTab extends StatelessWidget {
  final Map<String, dynamic> analytics;
  final ReportsProvider reports;
  final AppLocalizations l10n;

  const _AnalyticsTab({
    required this.analytics,
    required this.reports,
    required this.l10n,
  });

  @override
  Widget build(BuildContext context) {
    final catBreakdown = analytics['categoryBreakdown']
        as Map<ReportCategory, int>? ?? {};

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _ResponseTimeCard(analytics: analytics, l10n: l10n),
          const SizedBox(height: 16),
          if (catBreakdown.isNotEmpty) ...[
            _CategoryPieChart(breakdown: catBreakdown, l10n: l10n),
            const SizedBox(height: 16),
          ],
          _StatusBarChart(analytics: analytics, l10n: l10n),
        ],
      ),
    );
  }
}

class _ResponseTimeCard extends StatelessWidget {
  final Map<String, dynamic> analytics;
  final AppLocalizations l10n;

  const _ResponseTimeCard(
      {required this.analytics, required this.l10n});

  @override
  Widget build(BuildContext context) {
    final avgHours = analytics['avgResponseHours'] as int;
    final resRate = (analytics['resolutionRate'] as double).round();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 3)),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              children: [
                Text('$avgHours h',
                    style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary)),
                Text(l10n.responseTime,
                    style: TextStyle(
                        fontSize: 11, color: Colors.grey[600]),
                    textAlign: TextAlign.center),
              ],
            ),
          ),
          Container(width: 1, height: 50, color: Colors.grey[200]),
          Expanded(
            child: Column(
              children: [
                Text('$resRate%',
                    style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: AppColors.success)),
                Text(l10n.resolvedRate,
                    style: TextStyle(
                        fontSize: 11, color: Colors.grey[600]),
                    textAlign: TextAlign.center),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoryPieChart extends StatelessWidget {
  final Map<ReportCategory, int> breakdown;
  final AppLocalizations l10n;

  const _CategoryPieChart(
      {required this.breakdown, required this.l10n});

  @override
  Widget build(BuildContext context) {
    final entries = breakdown.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    final total = entries.fold(0, (s, e) => s + e.value);

    final colors = [
      AppColors.primary,
      AppColors.secondary,
      AppColors.error,
      AppColors.warning,
      AppColors.success,
      const Color(0xFF9C27B0),
      const Color(0xFF795548),
      const Color(0xFF607D8B),
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Reports by Category',
              style: TextStyle(
                  fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 16),
          SizedBox(
            height: 180,
            child: PieChart(
              PieChartData(
                sections: entries.asMap().entries.map((e) {
                  final pct = total > 0
                      ? (e.value.value / total * 100)
                      : 0.0;
                  return PieChartSectionData(
                    value: e.value.value.toDouble(),
                    color: colors[e.key % colors.length],
                    title: '${pct.round()}%',
                    radius: 60,
                    titleStyle: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.white),
                  );
                }).toList(),
                borderData: FlBorderData(show: false),
                centerSpaceRadius: 30,
                sectionsSpace: 2,
              ),
            ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 12,
            runSpacing: 6,
            children: entries.asMap().entries.map((e) {
              final color = colors[e.key % colors.length];
              return Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                          color: color, shape: BoxShape.circle)),
                  const SizedBox(width: 4),
                  Text(
                    '${e.value.key.name} (${e.value.value})',
                    style: const TextStyle(fontSize: 11),
                  ),
                ],
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _StatusBarChart extends StatelessWidget {
  final Map<String, dynamic> analytics;
  final AppLocalizations l10n;

  const _StatusBarChart(
      {required this.analytics, required this.l10n});

  @override
  Widget build(BuildContext context) {
    final pending = (analytics['pending'] as int).toDouble();
    final inProgress = (analytics['inProgress'] as int).toDouble();
    final resolved = (analytics['resolved'] as int).toDouble();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Reports by Status',
              style: TextStyle(
                  fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 16),
          SizedBox(
            height: 160,
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: [pending, inProgress, resolved]
                        .reduce((a, b) => a > b ? a : b) +
                    2,
                barGroups: [
                  _bar(0, pending, AppColors.warning),
                  _bar(1, inProgress, AppColors.secondary),
                  _bar(2, resolved, AppColors.success),
                ],
                borderData: FlBorderData(show: false),
                gridData: const FlGridData(show: false),
                titlesData: FlTitlesData(
                  leftTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false)),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (v, _) {
                        final labels = ['Pending', 'In Prog.', 'Resolved'];
                        return Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(labels[v.toInt()],
                              style: const TextStyle(fontSize: 10)),
                        );
                      },
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  BarChartGroupData _bar(int x, double y, Color color) {
    return BarChartGroupData(
      x: x,
      barRods: [
        BarChartRodData(
          toY: y,
          color: color,
          width: 40,
          borderRadius: const BorderRadius.vertical(
              top: Radius.circular(6)),
        ),
      ],
    );
  }
}
