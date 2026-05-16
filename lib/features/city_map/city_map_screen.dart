import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../../core/l10n/app_localizations.dart';
import '../../core/models/parking_spot_model.dart';
import '../../core/providers/parking_provider.dart';
import '../../core/providers/reports_provider.dart';

class CityMapScreen extends StatefulWidget {
  const CityMapScreen({super.key});

  @override
  State<CityMapScreen> createState() => _CityMapScreenState();
}

class _CityMapScreenState extends State<CityMapScreen> {
  bool _showParking = true;
  bool _showReports = true;
  bool _showTraffic = false;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final parking = context.watch<ParkingProvider>();
    final reports = context.watch<ReportsProvider>();

    final userLat = parking.userLat ?? AppConstants.defaultLat;
    final userLng = parking.userLng ?? AppConstants.defaultLng;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.cityMap),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Stack(
        children: [
          FlutterMap(
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
                  // User location
                  Marker(
                    point: LatLng(userLat, userLng),
                    width: 32,
                    height: 32,
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                      child: const Icon(Icons.person,
                          color: Colors.white, size: 16),
                    ),
                  ),
                  // Parking markers
                  if (_showParking)
                    ...parking.allSpots.map((spot) => Marker(
                          point: LatLng(spot.lat, spot.lng),
                          width: 36,
                          height: 36,
                          child: Container(
                            decoration: BoxDecoration(
                              color: spot.statusColor,
                              shape: BoxShape.circle,
                              border:
                                  Border.all(color: Colors.white, width: 2),
                            ),
                            child: const Icon(Icons.local_parking,
                                color: Colors.white, size: 18),
                          ),
                        )),
                  // Report markers
                  if (_showReports)
                    ...reports.allReports.map((report) => Marker(
                          point: LatLng(report.lat, report.lng),
                          width: 36,
                          height: 36,
                          child: Container(
                            decoration: BoxDecoration(
                              color: report.statusColor,
                              shape: BoxShape.circle,
                              border:
                                  Border.all(color: Colors.white, width: 2),
                            ),
                            child: Icon(report.categoryIcon,
                                color: Colors.white, size: 16),
                          ),
                        )),
                ],
              ),
            ],
          ),
          // Layer toggle panel
          Positioned(
            top: 16,
            right: 16,
            child: _buildLayerToggles(l10n),
          ),
          // Legend
          Positioned(
            bottom: 24,
            left: 16,
            child: _buildLegend(l10n),
          ),
        ],
      ),
    );
  }

  Widget _buildLayerToggles(AppLocalizations l10n) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 12,
              offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Layers',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
          const SizedBox(height: 8),
          _LayerToggle(
            icon: Icons.local_parking,
            label: l10n.parkingLayer,
            color: AppColors.primary,
            value: _showParking,
            onChanged: (v) => setState(() => _showParking = v),
          ),
          _LayerToggle(
            icon: Icons.report_problem_outlined,
            label: l10n.reportsLayer,
            color: AppColors.error,
            value: _showReports,
            onChanged: (v) => setState(() => _showReports = v),
          ),
          _LayerToggle(
            icon: Icons.traffic,
            label: l10n.trafficLayer,
            color: AppColors.warning,
            value: _showTraffic,
            onChanged: (v) => setState(() => _showTraffic = v),
          ),
        ],
      ),
    );
  }

  Widget _buildLegend(AppLocalizations l10n) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 8),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Parking',
              style: TextStyle(
                  fontWeight: FontWeight.bold, fontSize: 11)),
          const SizedBox(height: 6),
          _LegendItem(color: AppColors.parkingAvailable, label: l10n.available),
          _LegendItem(color: AppColors.parkingReserved, label: l10n.limited),
          _LegendItem(color: AppColors.parkingOccupied, label: l10n.full),
        ],
      ),
    );
  }
}

class _LayerToggle extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _LayerToggle({
    required this.icon,
    required this.label,
    required this.color,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 6),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 14),
          const SizedBox(width: 6),
          Text(label, style: const TextStyle(fontSize: 12)),
          const SizedBox(width: 8),
          SizedBox(
            width: 32,
            height: 18,
            child: Transform.scale(
              scale: 0.7,
              child: Switch(
                value: value,
                onChanged: onChanged,
                activeColor: color,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendItem({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 4),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
              width: 10,
              height: 10,
              decoration:
                  BoxDecoration(color: color, shape: BoxShape.circle)),
          const SizedBox(width: 6),
          Text(label, style: const TextStyle(fontSize: 11)),
        ],
      ),
    );
  }
}
