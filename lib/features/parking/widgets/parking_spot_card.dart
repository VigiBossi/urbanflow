import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/models/parking_spot_model.dart';

class ParkingSpotCard extends StatelessWidget {
  final ParkingSpot spot;
  final bool isAiPick;
  final bool isSelected;
  final VoidCallback onTap;

  const ParkingSpotCard({
    super.key,
    required this.spot,
    required this.onTap,
    this.isAiPick = false,
    this.isSelected = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected
                ? AppColors.primary
                : isAiPick
                    ? AppColors.primary.withOpacity(0.4)
                    : Colors.grey[200]!,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: (isSelected ? AppColors.primary : Colors.black)
                  .withOpacity(isSelected ? 0.12 : 0.04),
              blurRadius: isSelected ? 12 : 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            _StatusIcon(spot: spot),
            const SizedBox(width: 12),
            Expanded(child: _SpotInfo(spot: spot, isAiPick: isAiPick)),
            const SizedBox(width: 8),
            _PriceAvailability(spot: spot),
          ],
        ),
      ),
    );
  }
}

class _StatusIcon extends StatelessWidget {
  final ParkingSpot spot;
  const _StatusIcon({required this.spot});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 50,
      height: 50,
      decoration: BoxDecoration(
        color: spot.statusColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(Icons.local_parking, color: spot.statusColor, size: 28),
    );
  }
}

class _SpotInfo extends StatelessWidget {
  final ParkingSpot spot;
  final bool isAiPick;
  const _SpotInfo({required this.spot, required this.isAiPick});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Flexible(
              child: Text(
                spot.name,
                style: const TextStyle(
                    fontWeight: FontWeight.w700, fontSize: 13),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            if (isAiPick) ...[
              const SizedBox(width: 6),
              _AiBadge(),
            ],
          ],
        ),
        const SizedBox(height: 2),
        Text(
          spot.formattedDistance,
          style: TextStyle(fontSize: 11, color: Colors.grey[600]),
        ),
        const SizedBox(height: 4),
        _AmenityRow(amenities: spot.amenities),
      ],
    );
  }
}

class _AiBadge extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.amber.withOpacity(0.15),
        borderRadius: BorderRadius.circular(5),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.auto_awesome, size: 9, color: Colors.amber),
          SizedBox(width: 2),
          Text('AI',
              style: TextStyle(
                  fontSize: 9,
                  color: Colors.amber,
                  fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}

class _AmenityRow extends StatelessWidget {
  final List<String> amenities;
  const _AmenityRow({required this.amenities});

  static const _icons = {
    'covered': Icons.roofing,
    'ev_charging': Icons.ev_station,
    'handicap': Icons.accessible,
    'security': Icons.security,
    'open_air': Icons.wb_sunny_outlined,
  };

  @override
  Widget build(BuildContext context) {
    final icons = amenities
        .where(_icons.containsKey)
        .map((a) => _icons[a]!)
        .take(4)
        .toList();

    if (icons.isEmpty) return const SizedBox.shrink();

    return Row(
      children: icons
          .map((i) => Padding(
                padding: const EdgeInsets.only(right: 6),
                child: Icon(i, size: 13, color: Colors.grey[500]),
              ))
          .toList(),
    );
  }
}

class _PriceAvailability extends StatelessWidget {
  final ParkingSpot spot;
  const _PriceAvailability({required this.spot});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          spot.formattedPrice,
          style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
              fontSize: 14),
        ),
        const SizedBox(height: 4),
        Container(
          padding:
              const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
          decoration: BoxDecoration(
            color: spot.statusColor.withOpacity(0.12),
            borderRadius: BorderRadius.circular(7),
          ),
          child: Text(
            '${spot.availableSpots} free',
            style: TextStyle(
                color: spot.statusColor,
                fontSize: 10,
                fontWeight: FontWeight.w600),
          ),
        ),
      ],
    );
  }
}
