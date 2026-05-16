import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../core/models/parking_spot_model.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/services/ai_service.dart';
import '../../shared/widgets/gradient_button.dart';
import '../../shared/widgets/status_badge.dart';
import 'parking_payment_screen.dart';

class ParkingDetailScreen extends StatelessWidget {
  final ParkingSpot spot;
  const ParkingDetailScreen({super.key, required this.spot});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final prediction = AiService.getParkingPrediction(spot);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FF),
      body: CustomScrollView(
        slivers: [
          _buildSliverHeader(context, l10n),
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                _buildStatusCard(l10n),
                const SizedBox(height: 16),
                _buildAIPredictionCard(prediction),
                const SizedBox(height: 16),
                _buildDetailsCard(l10n),
                const SizedBox(height: 16),
                _buildAmenitiesCard(),
                const SizedBox(height: 24),
                _buildPayButton(context, l10n),
                const SizedBox(height: 16),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSliverHeader(BuildContext context, AppLocalizations l10n) {
    return SliverAppBar(
      expandedHeight: 160,
      pinned: true,
      backgroundColor: spot.statusColor,
      foregroundColor: Colors.white,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back),
        onPressed: () => Navigator.pop(context),
      ),
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [spot.statusColor, spot.statusColor.withOpacity(0.7)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 80, 20, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(spot.name,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.location_on,
                        color: Colors.white70, size: 14),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(spot.address,
                          style: const TextStyle(
                              color: Colors.white70, fontSize: 13),
                          overflow: TextOverflow.ellipsis),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusCard(AppLocalizations l10n) {
    return _Card(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _StatItem(
            icon: Icons.local_parking,
            value: '${spot.availableSpots}',
            label: l10n.spotsAvailable,
            color: spot.statusColor,
          ),
          _Divider(),
          _StatItem(
            icon: Icons.attach_money,
            value: spot.formattedPrice,
            label: l10n.pricePerHour,
            color: AppColors.primary,
          ),
          _Divider(),
          _StatItem(
            icon: Icons.directions_walk,
            value: '${spot.walkingMinutes ?? "?"} min',
            label: l10n.walkingDistance,
            color: const Color(0xFF00897B),
          ),
        ],
      ),
    );
  }

  Widget _buildAIPredictionCard(String prediction) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1565C0), Color(0xFF0288D1)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.auto_awesome,
                color: Colors.white, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('AI Demand Forecast',
                    style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 13)),
                const SizedBox(height: 4),
                Text(prediction,
                    style: TextStyle(
                        color: Colors.white.withOpacity(0.85),
                        fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailsCard(AppLocalizations l10n) {
    return _Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Parking Details',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 14),
          _DetailRow(Icons.grid_on, 'Total Capacity',
              '${spot.totalSpots} spots'),
          _DetailRow(Icons.percent, 'Current Occupancy',
              '${(spot.occupancyRate * 100).round()}%'),
          if (spot.zone != null)
            _DetailRow(Icons.zone_outlined ?? Icons.map, 'Zone', 'Zone ${spot.zone}'),
          _DetailRow(
            Icons.access_time,
            'Hours',
            spot.is24Hours ? 'Open 24 hours' : '${spot.openTime} - ${spot.closeTime}',
          ),
          if (spot.distanceMeters != null)
            _DetailRow(Icons.directions,
                'Distance', spot.formattedDistance),
          _DetailRow(Icons.check_circle_outline, 'Status', spot.statusLabel),
        ],
      ),
    );
  }

  Widget _buildAmenitiesCard() {
    if (spot.amenities.isEmpty) return const SizedBox.shrink();

    final amenityMap = {
      'covered': (Icons.roofing, 'Covered'),
      'ev_charging': (Icons.ev_station, 'EV Charging'),
      'handicap': (Icons.accessible, 'Accessible'),
      'security': (Icons.security, 'Security'),
      'open_air': (Icons.wb_sunny_outlined, 'Open Air'),
    };

    return _Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Amenities',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: spot.amenities.map((a) {
              final info = amenityMap[a] ??
                  (Icons.star_outline, a);
              return _AmenityChip(icon: info.$1, label: info.$2);
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildPayButton(BuildContext context, AppLocalizations l10n) {
    final canPay = spot.status != ParkingStatus.full &&
        spot.status != ParkingStatus.closed;
    return GradientButton(
      label: canPay ? l10n.payNow : 'Parking Full',
      icon: canPay ? Icons.payment : Icons.block,
      onPressed: canPay
          ? () => Navigator.push(context,
              MaterialPageRoute(
                  builder: (_) => ParkingPaymentScreen(spot: spot)))
          : null,
      colors: canPay
          ? null
          : [Colors.grey[400]!, Colors.grey[500]!],
    );
  }
}

class _Card extends StatelessWidget {
  final Widget child;
  const _Card({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 3)),
        ],
      ),
      child: child,
    );
  }
}

class _StatItem extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final Color color;

  const _StatItem({
    required this.icon,
    required this.value,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: color, size: 22),
        const SizedBox(height: 6),
        Text(value,
            style: TextStyle(
                fontWeight: FontWeight.bold, fontSize: 16, color: color)),
        Text(label,
            style: TextStyle(fontSize: 11, color: Colors.grey[600])),
      ],
    );
  }
}

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) =>
      Container(width: 1, height: 40, color: Colors.grey[200]);
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _DetailRow(this.icon, this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Colors.grey[500]),
          const SizedBox(width: 12),
          Text(label,
              style: TextStyle(fontSize: 13, color: Colors.grey[600])),
          const Spacer(),
          Text(value,
              style: const TextStyle(
                  fontSize: 13, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _AmenityChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _AmenityChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.08),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppColors.primary),
          const SizedBox(width: 6),
          Text(label,
              style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.primary,
                  fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
