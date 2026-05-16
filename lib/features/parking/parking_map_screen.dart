import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../../core/l10n/app_localizations.dart';
import '../../core/models/parking_spot_model.dart';
import '../../core/providers/parking_provider.dart';
import '../../core/services/ai_service.dart';
import 'parking_detail_screen.dart';

class ParkingMapScreen extends StatefulWidget {
  const ParkingMapScreen({super.key});

  @override
  State<ParkingMapScreen> createState() => _ParkingMapScreenState();
}

class _ParkingMapScreenState extends State<ParkingMapScreen> {
  final _mapCtrl = MapController();
  final _searchCtrl = TextEditingController();
  ParkingStatus? _activeFilter;
  bool _showList = false;

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final parking = context.watch<ParkingProvider>();
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      body: Stack(
        children: [
          _buildMap(parking),
          _buildTopBar(l10n, parking),
          _buildFilterChips(l10n, parking),
          if (_showList)
            _buildListDrawer(l10n, parking)
          else
            _buildBottomToggle(l10n),
          if (parking.isLoading)
            const Center(child: CircularProgressIndicator()),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => parking.loadNearbySpots(),
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.my_location, color: Colors.white),
      ),
    );
  }

  Widget _buildMap(ParkingProvider parking) {
    final userLat = parking.userLat ?? AppConstants.defaultLat;
    final userLng = parking.userLng ?? AppConstants.defaultLng;

    return FlutterMap(
      mapController: _mapCtrl,
      options: MapOptions(
        initialCenter: LatLng(userLat, userLng),
        initialZoom: AppConstants.defaultZoom,
        minZoom: 10,
        maxZoom: 19,
      ),
      children: [
        TileLayer(
          urlTemplate: AppConstants.tileUrlTemplate,
          userAgentPackageName: 'com.urbanflow.ai',
          maxZoom: 19,
        ),
        MarkerLayer(
          markers: [
            // User location marker
            Marker(
              point: LatLng(userLat, userLng),
              width: 36,
              height: 36,
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 3),
                  boxShadow: [
                    BoxShadow(
                        color: AppColors.primary.withOpacity(0.4),
                        blurRadius: 10),
                  ],
                ),
                child: const Icon(Icons.person, color: Colors.white, size: 18),
              ),
            ),
            // Parking markers
            ...parking.allSpots.map((spot) => _buildParkingMarker(spot, parking)),
          ],
        ),
      ],
    );
  }

  Marker _buildParkingMarker(ParkingSpot spot, ParkingProvider parking) {
    final isSelected = parking.selectedSpot?.id == spot.id;
    final isAiPick = parking.aiRecommendedSpot?.id == spot.id;

    return Marker(
      point: LatLng(spot.lat, spot.lng),
      width: isSelected ? 60 : 44,
      height: isSelected ? 60 : 44,
      child: GestureDetector(
        onTap: () {
          parking.selectSpot(spot);
          Navigator.push(context,
              MaterialPageRoute(builder: (_) => ParkingDetailScreen(spot: spot)));
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            color: spot.statusColor,
            shape: BoxShape.circle,
            border: Border.all(
                color: isAiPick ? Colors.amber : Colors.white,
                width: isAiPick ? 3 : 2),
            boxShadow: [
              BoxShadow(
                  color: spot.statusColor.withOpacity(0.5),
                  blurRadius: 8,
                  spreadRadius: isSelected ? 3 : 0),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (isAiPick)
                const Icon(Icons.auto_awesome, color: Colors.white, size: 12),
              Icon(Icons.local_parking,
                  color: Colors.white, size: isSelected ? 26 : 20),
              if (isSelected)
                Text('${spot.availableSpots}',
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopBar(AppLocalizations l10n, ParkingProvider parking) {
    return Positioned(
      top: MediaQuery.of(context).padding.top + 8,
      left: 16,
      right: 16,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 12,
                offset: const Offset(0, 3)),
          ],
        ),
        child: TextField(
          controller: _searchCtrl,
          onChanged: parking.setSearchQuery,
          decoration: InputDecoration(
            hintText: '${l10n.search} parking...',
            prefixIcon: const Icon(Icons.search, color: Colors.grey),
            suffixIcon: _searchCtrl.text.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.clear, size: 18),
                    onPressed: () {
                      _searchCtrl.clear();
                      parking.setSearchQuery('');
                    },
                  )
                : null,
            border: InputBorder.none,
            enabledBorder: InputBorder.none,
            focusedBorder: InputBorder.none,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChips(AppLocalizations l10n, ParkingProvider parking) {
    return Positioned(
      top: MediaQuery.of(context).padding.top + 70,
      left: 16,
      right: 16,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _FilterChip(
              label: 'All',
              selected: _activeFilter == null,
              color: Colors.grey,
              onTap: () {
                setState(() => _activeFilter = null);
                parking.setStatusFilter(null);
              },
            ),
            const SizedBox(width: 8),
            _FilterChip(
              label: l10n.available,
              selected: _activeFilter == ParkingStatus.available,
              color: AppColors.parkingAvailable,
              onTap: () {
                setState(() => _activeFilter = ParkingStatus.available);
                parking.setStatusFilter(ParkingStatus.available);
              },
            ),
            const SizedBox(width: 8),
            _FilterChip(
              label: l10n.limited,
              selected: _activeFilter == ParkingStatus.limited,
              color: AppColors.parkingReserved,
              onTap: () {
                setState(() => _activeFilter = ParkingStatus.limited);
                parking.setStatusFilter(ParkingStatus.limited);
              },
            ),
            const SizedBox(width: 8),
            _FilterChip(
              label: l10n.full,
              selected: _activeFilter == ParkingStatus.full,
              color: AppColors.parkingOccupied,
              onTap: () {
                setState(() => _activeFilter = ParkingStatus.full);
                parking.setStatusFilter(ParkingStatus.full);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomToggle(AppLocalizations l10n) {
    return Positioned(
      bottom: 80,
      left: 16,
      right: 16,
      child: ElevatedButton.icon(
        onPressed: () => setState(() => _showList = true),
        icon: const Icon(Icons.list, size: 18),
        label: Text(l10n.nearbyParking),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.white,
          foregroundColor: AppColors.primary,
          elevation: 4,
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24)),
          padding: const EdgeInsets.symmetric(vertical: 12),
        ),
      ),
    );
  }

  Widget _buildListDrawer(AppLocalizations l10n, ParkingProvider parking) {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        height: MediaQuery.of(context).size.height * 0.5,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          boxShadow: [
            BoxShadow(color: Colors.black12, blurRadius: 20),
          ],
        ),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
              child: Row(
                children: [
                  Text(l10n.nearbyParking,
                      style: const TextStyle(
                          fontSize: 17, fontWeight: FontWeight.bold)),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => setState(() => _showList = false),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 8),
                itemCount: parking.spots.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (_, i) {
                  final spot = parking.spots[i];
                  return _ParkingListItem(
                    spot: spot,
                    isAiPick: parking.aiRecommendedSpot?.id == spot.id,
                    onTap: () {
                      parking.selectSpot(spot);
                      setState(() => _showList = false);
                      _mapCtrl.move(
                          LatLng(spot.lat, spot.lng), 16);
                      Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) =>
                                  ParkingDetailScreen(spot: spot)));
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final Color color;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.selected,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: selected ? color : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: selected ? color : Colors.grey[300]!),
          boxShadow: selected
              ? [BoxShadow(color: color.withOpacity(0.3), blurRadius: 6)]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.white : Colors.grey[700],
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

class _ParkingListItem extends StatelessWidget {
  final ParkingSpot spot;
  final bool isAiPick;
  final VoidCallback onTap;

  const _ParkingListItem({
    required this.spot,
    required this.isAiPick,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isAiPick
                ? AppColors.primary.withOpacity(0.4)
                : Colors.grey[200]!,
            width: isAiPick ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: spot.statusColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(Icons.local_parking,
                  color: spot.statusColor, size: 26),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(spot.name,
                            style: const TextStyle(
                                fontWeight: FontWeight.w700, fontSize: 13),
                            overflow: TextOverflow.ellipsis),
                      ),
                      if (isAiPick)
                        Container(
                          margin: const EdgeInsets.only(left: 6),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.amber.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.auto_awesome,
                                  size: 10, color: Colors.amber),
                              SizedBox(width: 2),
                              Text('AI Pick',
                                  style: TextStyle(
                                      fontSize: 9,
                                      color: Colors.amber,
                                      fontWeight: FontWeight.w700)),
                            ],
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(spot.formattedDistance,
                      style:
                          TextStyle(fontSize: 11, color: Colors.grey[600])),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(spot.formattedPrice,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                        fontSize: 13)),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: spot.statusColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
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
            ),
          ],
        ),
      ),
    );
  }
}
