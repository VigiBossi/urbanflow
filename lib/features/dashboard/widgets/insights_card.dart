import 'package:material_ui/material_ui.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/utils/enum_labels.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../data/models/insight.dart';
import '../../../l10n/generated/app_localizations.dart';

/// Localized sentence for a rule-based [Insight].
String insightText(Insight i, AppLocalizations l10n) {
  final fmt = Formatters(l10n);
  final category = i.category?.label(l10n) ?? '';
  return switch (i.type) {
    InsightType.categorySpike => l10n.insightSpike(
      category,
      i.neighborhood ?? '',
      i.percent ?? 0,
    ),
    InsightType.categoryDrop => l10n.insightDrop(category, i.percent ?? 0),
    InsightType.hotspot => l10n.insightHotspot(
      i.neighborhood ?? '',
      i.count ?? 0,
    ),
    InsightType.unassignedCritical => l10n.insightUnassigned(i.count ?? 0),
    InsightType.slowResolution => l10n.insightSlowResolution(
      category,
      fmt.number(i.days ?? 0, decimals: 1),
    ),
    InsightType.peakOccupancy => l10n.insightPeakOccupancy(
      fmt.hourLabel(i.hour ?? 0),
      i.percent ?? 0,
    ),
    InsightType.fullParking => l10n.insightFullParking(i.count ?? 0),
  };
}

class InsightsCard extends StatelessWidget {
  const InsightsCard({super.key, required this.insights});

  final List<Insight> insights;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(Spacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.auto_awesome, color: theme.colorScheme.primary),
                const SizedBox(width: Spacing.sm),
                Text(l10n.aiInsights, style: theme.textTheme.titleMedium),
              ],
            ),
            const SizedBox(height: Spacing.md),
            if (insights.isEmpty)
              Text(l10n.noInsights)
            else
              for (final insight in insights)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: Spacing.xs),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: insight.severity.color.withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          insight.severity.icon,
                          size: 16,
                          color: insight.severity.color,
                        ),
                      ),
                      const SizedBox(width: Spacing.md),
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(insightText(insight, l10n)),
                        ),
                      ),
                    ],
                  ),
                ),
          ],
        ),
      ),
    );
  }
}
