import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/routing/app_router.dart';
import '../../../core/utils/enum_labels.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../core/widgets/responsive.dart';
import '../../../core/widgets/state_views.dart';
import '../../../data/models/city_report.dart';
import '../../../providers/report_provider.dart';
import '../../../providers/view_status.dart';
import '../widgets/filter_menu_chip.dart';
import '../widgets/report_card.dart';
import '../widgets/reports_table.dart';

/// Municipality view: filter, sort and open reports for management.
class ManageReportsScreen extends StatelessWidget {
  const ManageReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final provider = context.watch<ReportProvider>();
    final filter = provider.filter;
    final reports = provider.filteredReports;
    final padding = Responsive.pagePadding(context);

    Widget content;
    if (provider.status == ViewStatus.error) {
      content = ErrorView(onRetry: provider.refresh);
    } else if (provider.status != ViewStatus.ready &&
        provider.reports.isEmpty) {
      content = const LoadingView();
    } else if (reports.isEmpty) {
      content = EmptyView(
        icon: Icons.filter_alt_off_outlined,
        title: l10n.noMatchingTitle,
        message: l10n.noMatchingMessage,
        action: filter.isEmpty
            ? null
            : TextButton(
                onPressed: () =>
                    provider.setFilter(ReportFilter(sort: filter.sort)),
                child: Text(l10n.clearFilters),
              ),
      );
    } else if (Responsive.isExpanded(context)) {
      content = RefreshIndicator(
        onRefresh: provider.refresh,
        child: ListView(
          padding: EdgeInsets.fromLTRB(padding, 0, padding, Spacing.xl),
          children: [Card(child: ReportsTable(reports: reports))],
        ),
      );
    } else {
      content = RefreshIndicator(
        onRefresh: provider.refresh,
        child: ListView.separated(
          padding: EdgeInsets.fromLTRB(padding, 0, padding, Spacing.xl),
          itemCount: reports.length,
          separatorBuilder: (_, _) => const SizedBox(height: Spacing.sm),
          itemBuilder: (context, i) {
            final r = reports[i];
            return ReportCard(
              report: r,
              showPriority: true,
              assigneeName: provider.staffById(r.assignedStaffId)?.name,
              onTap: () =>
                  Navigator.of(context)
                      .pushNamed(AppRoutes.adminReportDetail, arguments: r.id),
            );
          },
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.manageReports),
        actions: [
          IconButton(
            tooltip: l10n.retry,
            onPressed: provider.refresh,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: EdgeInsets.symmetric(horizontal: padding),
            child: Row(
              children: [
                FilterMenuChip<ReportStatus>(
                  label: l10n.filterStatus,
                  allLabel: l10n.all,
                  values: ReportStatus.values,
                  value: filter.status,
                  valueLabel: (v) => v.label(l10n),
                  onChanged: (v) =>
                      provider.setFilter(filter.copyWith(status: () => v)),
                ),
                const SizedBox(width: Spacing.sm),
                FilterMenuChip<ReportCategory>(
                  label: l10n.filterCategory,
                  allLabel: l10n.all,
                  values: ReportCategory.values,
                  value: filter.category,
                  valueLabel: (v) => v.label(l10n),
                  onChanged: (v) =>
                      provider.setFilter(filter.copyWith(category: () => v)),
                ),
                const SizedBox(width: Spacing.sm),
                FilterMenuChip<ReportPriority>(
                  label: l10n.filterPriority,
                  allLabel: l10n.all,
                  values: ReportPriority.values.reversed.toList(),
                  value: filter.priority,
                  valueLabel: (v) => v.label(l10n),
                  onChanged: (v) =>
                      provider.setFilter(filter.copyWith(priority: () => v)),
                ),
                const SizedBox(width: Spacing.sm),
                FilterMenuChip<String>(
                  label: l10n.filterNeighborhood,
                  allLabel: l10n.all,
                  values: provider.neighborhoods,
                  value: filter.neighborhood,
                  valueLabel: (v) => v,
                  onChanged: (v) => provider.setFilter(
                    filter.copyWith(neighborhood: () => v),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: padding,
              vertical: Spacing.sm,
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    l10n.reportsCount(reports.length),
                    style: Theme.of(context).textTheme.labelLarge,
                  ),
                ),
                SegmentedButton<ReportSort>(
                  showSelectedIcon: false,
                  segments: [
                    ButtonSegment(
                      value: ReportSort.newest,
                      icon: const Icon(Icons.schedule, size: 18),
                      tooltip: l10n.sortNewest,
                    ),
                    ButtonSegment(
                      value: ReportSort.priority,
                      icon: const Icon(Icons.flag_outlined, size: 18),
                      tooltip: l10n.sortPriority,
                    ),
                  ],
                  selected: {filter.sort},
                  onSelectionChanged: (s) =>
                      provider.setFilter(filter.copyWith(sort: s.first)),
                ),
              ],
            ),
          ),
          Expanded(child: content),
        ],
      ),
    );
  }
}
