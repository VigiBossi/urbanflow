import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/routing/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../core/widgets/responsive.dart';
import '../../../core/widgets/section_header.dart';
import '../../../core/widgets/state_views.dart';
import '../../../data/models/dashboard_data.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/dashboard_provider.dart';
import '../../../providers/report_provider.dart';
import '../../../providers/view_status.dart';
import '../../reports/widgets/report_card.dart';
import '../../reports/widgets/reports_table.dart';
import '../widgets/chart_card.dart';
import '../widgets/dashboard_charts.dart';
import '../widgets/insights_card.dart';
import '../widgets/kpi_card.dart';

/// Municipality dashboard: KPIs, charts, AI insights and report management.
class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key, this.onViewAllReports});

  final VoidCallback? onViewAllReports;

  Future<void> _refresh(BuildContext context) async {
    await Future.wait([
      context.read<DashboardProvider>().load(),
      context.read<ReportProvider>().refresh(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final dashboard = context.watch<DashboardProvider>();
    final user = context.watch<AuthProvider>().user;
    final data = dashboard.data;

    Widget body;
    if (dashboard.status == ViewStatus.error && data == null) {
      body = ErrorView(onRetry: () => _refresh(context));
    } else if (data == null) {
      body = const LoadingView();
    } else {
      body = RefreshIndicator(
        onRefresh: () => _refresh(context),
        child: _DashboardBody(data: data, onViewAll: onViewAllReports),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(l10n.dashboardTitle),
            if (user != null)
              Text(
                l10n.greeting(user.name),
                style: Theme.of(context).textTheme.bodySmall,
              ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: l10n.retry,
            onPressed: () => _refresh(context),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: body,
    );
  }
}

class _DashboardBody extends StatelessWidget {
  const _DashboardBody({required this.data, this.onViewAll});

  final DashboardData data;
  final VoidCallback? onViewAll;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = Formatters(l10n);
    final reports = context.watch<ReportProvider>();
    final width = Responsive.width(context);
    final padding = Responsive.pagePadding(context);
    final kpiColumns = width >= Breakpoints.expanded ? 4 : 2;
    final chartColumns = width >= 1100
        ? 3
        : (width >= Breakpoints.medium ? 2 : 1);

    final avg = data.avgResolutionHours;
    final avgText = avg == null
        ? l10n.notAvailable
        : avg >= 48
        ? l10n.valueDays(fmt.number(avg / 24, decimals: 1))
        : l10n.valueHours(fmt.number(avg, decimals: 0));

    final kpis = [
      KpiCard(
        icon: Icons.assignment_late_outlined,
        label: l10n.kpiOpenReports,
        value: fmt.number(data.openReports),
        color: AppColors.priorityHigh,
      ),
      KpiCard(
        icon: Icons.timer_outlined,
        label: l10n.kpiAvgResolution,
        value: avgText,
        color: AppColors.priorityLow,
      ),
      KpiCard(
        icon: Icons.local_parking,
        label: l10n.kpiOccupancy,
        value: fmt.percent(data.parkingOccupancy),
        color: AppColors.seed,
      ),
      KpiCard(
        icon: Icons.payments_outlined,
        label: l10n.kpiRevenue,
        value: fmt.money(data.revenueToday),
        color: AppColors.availabilityHigh,
      ),
    ];

    final charts = [
      ChartCard(
        title: l10n.chartByCategory,
        child: CategoryPieChart(data: data.reportsByCategory),
      ),
      ChartCard(
        title: l10n.chartOverTime,
        child: ReportsLineChart(data: data.reportsPerDay),
      ),
      ChartCard(
        title: l10n.chartOccupancyByHour,
        child: OccupancyBarChart(
          data: data.occupancyByHour,
          now: DateTime.now(),
        ),
      ),
    ];

    final recent = reports.reports.where((r) => r.isOpen).toList()
      ..sort((a, b) {
        final p = b.priority.index.compareTo(a.priority.index);
        return p != 0 ? p : b.createdAt.compareTo(a.createdAt);
      });
    final top = recent.take(6).toList();

    return ListView(
      padding: EdgeInsets.fromLTRB(padding, Spacing.sm, padding, Spacing.xxl),
      children: [
        GridView.count(
          crossAxisCount: kpiColumns,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: Spacing.md,
          crossAxisSpacing: Spacing.md,
          childAspectRatio: kpiColumns == 4 ? 1.7 : 1.35,
          children: kpis,
        ),
        const SizedBox(height: Spacing.lg),
        InsightsCard(insights: data.insights),
        const SizedBox(height: Spacing.lg),
        _ResponsiveGrid(columns: chartColumns, children: charts),
        SectionHeader(
          title: l10n.reportManagement,
          trailing: onViewAll == null
              ? null
              : TextButton(onPressed: onViewAll, child: Text(l10n.viewAll)),
        ),
        if (Responsive.isExpanded(context))
          Card(child: ReportsTable(reports: top))
        else
          for (final r in top)
            Padding(
              padding: const EdgeInsets.only(bottom: Spacing.sm),
              child: ReportCard(
                report: r,
                showPriority: true,
                assigneeName: reports.staffById(r.assignedStaffId)?.name,
                onTap: () => Navigator.of(context)
                    .pushNamed(AppRoutes.adminReportDetail, arguments: r.id),
              ),
            ),
      ],
    );
  }
}

/// Lays out children in rows of [columns] with equal widths.
class _ResponsiveGrid extends StatelessWidget {
  const _ResponsiveGrid({required this.columns, required this.children});

  final int columns;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final rows = <Widget>[];
    for (var i = 0; i < children.length; i += columns) {
      final slice = children.skip(i).take(columns).toList();
      rows.add(
        Padding(
          padding: const EdgeInsets.only(bottom: Spacing.md),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              for (var j = 0; j < columns; j++) ...[
                if (j > 0) const SizedBox(width: Spacing.md),
                Expanded(
                  child: j < slice.length ? slice[j] : const SizedBox.shrink(),
                ),
              ],
            ],
          ),
        ),
      );
    }
    return Column(children: rows);
  }
}
