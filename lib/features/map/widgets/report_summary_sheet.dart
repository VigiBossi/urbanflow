import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/routing/app_router.dart';
import '../../../core/utils/enum_labels.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../data/models/city_report.dart';
import '../../../providers/auth_provider.dart';
import '../../reports/widgets/report_chips.dart';

Future<void> showReportSummarySheet(BuildContext context, CityReport report) {
  return showModalBottomSheet<void>(
    context: context,
    useSafeArea: true,
    constraints: const BoxConstraints(maxWidth: 640),
    builder: (_) => ReportSummarySheet(report: report),
  );
}

/// Compact report details opened from a map marker.
class ReportSummarySheet extends StatelessWidget {
  const ReportSummarySheet({super.key, required this.report});

  final CityReport report;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = Formatters(l10n);
    final theme = Theme.of(context);
    final user = context.read<AuthProvider>().user;
    final route = user?.isMunicipality ?? false
        ? AppRoutes.adminReportDetail
        : (report.reporterId == user?.id ? AppRoutes.reportDetail : null);

    return Padding(
      padding: const EdgeInsets.fromLTRB(Spacing.xl, 0, Spacing.xl, Spacing.xl),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CategoryAvatar(category: report.category),
              const SizedBox(width: Spacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      report.category.label(l10n),
                      style: theme.textTheme.titleMedium,
                    ),
                    Text(
                      '${report.neighborhood} · ${fmt.relative(report.createdAt)}',
                      style: theme.textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: Spacing.md),
          Wrap(
            spacing: Spacing.sm,
            children: [
              StatusChip(status: report.status),
              if (user?.isMunicipality ?? false)
                PriorityChip(priority: report.priority),
            ],
          ),
          const SizedBox(height: Spacing.md),
          Text(report.description),
          if (route != null) ...[
            const SizedBox(height: Spacing.lg),
            SizedBox(
              width: double.infinity,
              child: FilledButton.tonal(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.of(context).pushNamed(route, arguments: report.id);
                },
                child: Text(l10n.reportDetails),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
