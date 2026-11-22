import 'package:material_ui/material_ui.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../data/models/parking_spot.dart';

/// Colored pill with the number of free spaces.
class AvailabilityBadge extends StatelessWidget {
  const AvailabilityBadge({super.key, required this.spot});

  final ParkingSpot spot;

  @override
  Widget build(BuildContext context) {
    final color = AppColors.forAvailability(spot.available, spot.capacity);
    final text = spot.isFull
        ? context.l10n.spotFull
        : context.l10n.spotsFree(spot.available, spot.capacity);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.circle, size: 8, color: color),
          const SizedBox(width: 6),
          Text(
            text,
            style: Theme.of(context).textTheme.labelMedium
                ?.copyWith(color: color, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
