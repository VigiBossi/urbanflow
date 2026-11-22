import 'package:material_ui/material_ui.dart';

import '../../../core/theme/app_colors.dart';
import '../../../data/models/parking_spot.dart';

/// Map pin colored by availability, showing free spaces.
class ParkingMarker extends StatelessWidget {
  const ParkingMarker({
    super.key,
    required this.spot,
    this.highlighted = false,
  });

  final ParkingSpot spot;
  final bool highlighted;

  @override
  Widget build(BuildContext context) {
    final color = AppColors.forAvailability(spot.available, spot.capacity);
    return AnimatedScale(
      scale: highlighted ? 1.2 : 1,
      duration: const Duration(milliseconds: 200),
      child: Container(
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.white, width: 2),
          boxShadow: const [
            BoxShadow(
              blurRadius: 4,
              color: Colors.black26,
              offset: Offset(0, 2),
            ),
          ],
        ),
        alignment: Alignment.center,
        child: FittedBox(
          child: Padding(
            padding: const EdgeInsets.all(4),
            child: Text(
              spot.isFull ? 'P' : '${spot.available}',
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
