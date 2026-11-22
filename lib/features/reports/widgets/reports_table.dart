import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/routing/app_router.dart';
import '../../../core/utils/enum_labels.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../data/models/city_report.dart';
import '../../../providers/report_provider.dart';
import 'report_chips.dart';

/// Tabular report management view for wide screens.
class ReportsTable extends StatelessWidget {
  const ReportsTable({super.key, required this.reports});

  final List<CityReport> reports;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = Formatters(l10n);
    final provider = context.watch<ReportProvider>();
    return LayoutBuilder(
      builder: (context, constraints) => SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: ConstrainedBox(
          constraints: BoxConstraints(minWidth: constraints.maxWidth),
          child: DataTable(
            showCheckboxColumn: false,
            columnSpacing: 24,
            columns: [
              DataColumn(label: Text(l10n.categoryLabel)),
              DataColumn(label: Text(l10n.neighborhoodLabel)),
              DataColumn(label: Text(l10n.statusLabel)),
              DataColumn(label: Text(l10n.priorityLabel)),
              DataColumn(label: Text(l10n.assigneeLabel)),
              DataColumn(label: Text(l10n.createdLabel)),
            ],
            rows: [
              for (final r in reports)
                DataRow(
                  onSelectChanged: (_) => Navigator.of(context)
                      .pushNamed(AppRoutes.adminReportDetail, arguments: r.id),
                  cells: [
                    DataCell(
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CategoryAvatar(category: r.category, size: 28),
                          const SizedBox(width: 8),
                          Text(r.category.label(l10n)),
                        ],
                      ),
                    ),
                    DataCell(Text(r.neighborhood)),
                    DataCell(StatusChip(status: r.status)),
                    DataCell(PriorityChip(priority: r.priority)),
                    DataCell(
                      Text(
                        provider.staffById(r.assignedStaffId)?.name ??
                            l10n.unassigned,
                      ),
                    ),
                    DataCell(Text(fmt.relative(r.createdAt))),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }
}
