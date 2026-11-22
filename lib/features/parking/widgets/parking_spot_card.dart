import 'package:material_ui/material_ui.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/utils/enum_labels.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../data/services/parking_scorer.dart';
import 'availability_badge.dart';

/// List item for a ranked parking spot.
class ParkingSpotCard extends StatelessWidget {
  const ParkingSpotCard({
    super.key,
    required this.scored,
    required this.onTap,
    this.isTopPick = false,
    this.selected = false,
  });

  final ScoredParkingSpot scored;
  final VoidCallback onTap;
  final bool isTopPick;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = Formatters(l10n);
    final theme = Theme.of(context);
    final spot = scored.spot;

    return Card(
      color: selected ? theme.colorScheme.secondaryContainer : null,
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(Spacing.md),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: theme.colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  spot.type.icon,
                  color: theme.colorScheme.onPrimaryContainer,
                ),
              ),
              const SizedBox(width: Spacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (isTopPick)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 2),
                        child: Text(
                          l10n.topPick.toUpperCase(),
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: theme.colorScheme.primary,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ),
                    Text(
                      spot.name,
                      style: theme.textTheme.titleSmall,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${spot.neighborhood} · ${fmt.distance(scored.distanceMeters)}'
                      ' · ${fmt.pricePerHour(spot.pricePerHour)}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: Spacing.xs),
                    AvailabilityBadge(spot: spot),
                  ],
                ),
              ),
              const SizedBox(width: Spacing.sm),
              Column(
                children: [
                  Text(
                    '${scored.score.total.round()}',
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                  Text(l10n.scoreLabel, style: theme.textTheme.labelSmall),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
