import 'package:material_ui/material_ui.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../data/services/parking_scorer.dart';

/// "Why this spot": one bar per scoring factor.
class ScoreBreakdownView extends StatelessWidget {
  const ScoreBreakdownView({super.key, required this.score});

  final ScoreBreakdown score;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(Icons.auto_awesome, color: theme.colorScheme.primary),
            const SizedBox(width: Spacing.sm),
            Expanded(
              child: Text(l10n.whyThisSpot, style: theme.textTheme.titleMedium),
            ),
            _ScoreCircle(value: score.total.round()),
          ],
        ),
        const SizedBox(height: Spacing.md),
        _FactorBar(
          icon: Icons.near_me_outlined,
          label: l10n.factorDistance,
          value: score.distance,
        ),
        _FactorBar(
          icon: Icons.event_available_outlined,
          label: l10n.factorAvailability,
          value: score.availability,
        ),
        _FactorBar(
          icon: Icons.payments_outlined,
          label: l10n.factorPrice,
          value: score.price,
        ),
        _FactorBar(
          icon: Icons.schedule_outlined,
          label: l10n.factorDemand,
          value: score.demand,
        ),
        const SizedBox(height: Spacing.sm),
        Text(
          l10n.scoreExplanation,
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}

class _ScoreCircle extends StatelessWidget {
  const _ScoreCircle({required this.value});

  final int value;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return SizedBox.square(
      dimension: 48,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CircularProgressIndicator(
            value: value / 100,
            strokeWidth: 5,
            backgroundColor: scheme.surfaceContainerHighest,
          ),
          Text(
            '$value',
            style: Theme.of(context).textTheme.titleSmall
                ?.copyWith(fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );
  }
}

class _FactorBar extends StatelessWidget {
  const _FactorBar({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final double value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final percent = (value * 100).round();
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: Spacing.xs),
      child: Row(
        children: [
          Icon(icon, size: 18, color: theme.colorScheme.onSurfaceVariant),
          const SizedBox(width: Spacing.sm),
          SizedBox(
            width: 130,
            child: Text(
              label,
              style: theme.textTheme.bodySmall,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: value,
                minHeight: 8,
                backgroundColor: theme.colorScheme.surfaceContainerHighest,
              ),
            ),
          ),
          const SizedBox(width: Spacing.sm),
          SizedBox(
            width: 32,
            child: Text(
              '$percent',
              textAlign: TextAlign.end,
              style: theme.textTheme.labelMedium,
            ),
          ),
        ],
      ),
    );
  }
}
