import 'package:material_ui/material_ui.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/utils/enum_labels.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../data/models/city_report.dart';

/// Vertical stepper showing the report lifecycle.
class StatusTimeline extends StatelessWidget {
  const StatusTimeline({super.key, required this.report});

  final CityReport report;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = Formatters(l10n);
    final theme = Theme.of(context);
    final current = report.status.index;

    DateTime? reachedAt(ReportStatus s) {
      for (final h in report.history.reversed) {
        if (h.status == s) return h.changedAt;
      }
      return null;
    }

    return Column(
      children: [
        for (final status in ReportStatus.values)
          IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(
                  width: 32,
                  child: Column(
                    children: [
                      Icon(
                        status.index <= current
                            ? Icons.check_circle
                            : Icons.radio_button_unchecked,
                        color: status.index <= current
                            ? status.color
                            : theme.colorScheme.outline,
                        size: 22,
                      ),
                      if (status != ReportStatus.values.last)
                        Expanded(
                          child: Container(
                            width: 2,
                            color: status.index < current
                                ? status.color
                                : theme.colorScheme.outlineVariant,
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(width: Spacing.sm),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: Spacing.lg),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          status.label(l10n),
                          style: theme.textTheme.titleSmall?.copyWith(
                            color: status.index <= current
                                ? null
                                : theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                        if (status.index <= current &&
                            reachedAt(status) != null)
                          Text(
                            fmt.dateTime(reachedAt(status)!),
                            style: theme.textTheme.bodySmall,
                          ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}
