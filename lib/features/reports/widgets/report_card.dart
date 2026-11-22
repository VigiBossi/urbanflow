import 'package:material_ui/material_ui.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/utils/enum_labels.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../data/models/city_report.dart';
import 'report_chips.dart';

class ReportCard extends StatelessWidget {
  const ReportCard({
    super.key,
    required this.report,
    required this.onTap,
    this.showPriority = false,
    this.assigneeName,
  });

  final CityReport report;
  final VoidCallback onTap;
  final bool showPriority;
  final String? assigneeName;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = Formatters(l10n);
    final theme = Theme.of(context);
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(Spacing.md),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CategoryAvatar(category: report.category),
              const SizedBox(width: Spacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            report.category.label(l10n),
                            style: theme.textTheme.titleSmall,
                          ),
                        ),
                        Text(
                          fmt.relative(report.createdAt),
                          style: theme.textTheme.bodySmall,
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      report.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodyMedium,
                    ),
                    const SizedBox(height: Spacing.sm),
                    Wrap(
                      spacing: Spacing.sm,
                      runSpacing: Spacing.xs,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        StatusChip(status: report.status),
                        if (showPriority)
                          PriorityChip(priority: report.priority),
                        Text(
                          report.neighborhood,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                        if (assigneeName != null)
                          Text(
                            '· $assigneeName',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
