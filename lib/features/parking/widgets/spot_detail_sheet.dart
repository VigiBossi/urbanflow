import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/routing/app_router.dart';
import '../../../core/utils/enum_labels.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../data/services/parking_scorer.dart';
import '../../../providers/parking_provider.dart';
import 'availability_badge.dart';
import 'score_breakdown_view.dart';

/// Bottom sheet with spot details, score breakdown and the pay action.
Future<void> showSpotDetailSheet(BuildContext context, String spotId) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    constraints: const BoxConstraints(maxWidth: 640),
    builder: (_) => SpotDetailSheet(spotId: spotId),
  );
}

class SpotDetailSheet extends StatelessWidget {
  const SpotDetailSheet({super.key, required this.spotId});

  final String spotId;

  @override
  Widget build(BuildContext context) {
    // Watch so availability updates live while the sheet is open.
    final ScoredParkingSpot? scored = context
        .watch<ParkingProvider>()
        .scoredById(spotId);
    if (scored == null) return const SizedBox(height: 200);
    final l10n = context.l10n;
    final fmt = Formatters(l10n);
    final theme = Theme.of(context);
    final spot = scored.spot;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(Spacing.xl, 0, Spacing.xl, Spacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(spot.name, style: theme.textTheme.titleLarge),
          const SizedBox(height: Spacing.xs),
          Wrap(
            spacing: Spacing.sm,
            runSpacing: Spacing.xs,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              AvailabilityBadge(spot: spot),
              Chip(
                avatar: Icon(spot.type.icon, size: 16),
                label: Text(spot.type.label(l10n)),
                visualDensity: VisualDensity.compact,
              ),
              Chip(
                label: Text(l10n.zoneLabel(spot.zone)),
                visualDensity: VisualDensity.compact,
              ),
            ],
          ),
          const SizedBox(height: Spacing.md),
          Row(
            children: [
              _Fact(
                icon: Icons.place_outlined,
                text:
                    '${spot.neighborhood} · ${fmt.distance(scored.distanceMeters)}',
              ),
              const SizedBox(width: Spacing.lg),
              _Fact(
                icon: Icons.payments_outlined,
                text: fmt.pricePerHour(spot.pricePerHour),
              ),
            ],
          ),
          const Divider(height: Spacing.xxl),
          ScoreBreakdownView(score: scored.score),
          const SizedBox(height: Spacing.xl),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: spot.isFull
                  ? null
                  : () {
                      Navigator.pop(context);
                      Navigator.of(context)
                          .pushNamed(AppRoutes.payment, arguments: spot);
                    },
              icon: const Icon(Icons.credit_card),
              label: Text(spot.isFull ? l10n.spotFull : l10n.payAndPark),
            ),
          ),
        ],
      ),
    );
  }
}

class _Fact extends StatelessWidget {
  const _Fact({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) => Flexible(
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 18),
        const SizedBox(width: Spacing.xs),
        Flexible(child: Text(text, overflow: TextOverflow.ellipsis)),
      ],
    ),
  );
}
