import 'package:flutter_map/flutter_map.dart';
import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/clustering.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../core/widgets/osm_layers.dart';
import '../../../core/widgets/state_views.dart';
import '../../../data/models/city_report.dart';
import '../../../providers/location_provider.dart';
import '../../../providers/map_provider.dart';
import '../../../providers/parking_provider.dart';
import '../../../providers/view_status.dart';
import '../../parking/widgets/parking_marker.dart';
import '../../parking/widgets/spot_detail_sheet.dart';
import '../../reports/widgets/report_marker.dart';
import '../widgets/report_summary_sheet.dart';

/// Interactive city map with parking and report layers.
class CityMapScreen extends StatefulWidget {
  const CityMapScreen({super.key});

  @override
  State<CityMapScreen> createState() => _CityMapScreenState();
}

class _CityMapScreenState extends State<CityMapScreen> {
  final _mapController = MapController();
  double _zoom = AppConstants.defaultMapZoom;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final map = context.read<MapProvider>();
      if (map.status == ViewStatus.initial) map.load();
    });
  }

  void _onPositionChanged(MapCamera camera, bool hasGesture) {
    // Re-cluster only when the zoom changes by a meaningful step.
    final rounded = (camera.zoom * 2).round() / 2;
    if (rounded != _zoom) setState(() => _zoom = rounded);
  }

  void _zoomInto(Cluster<CityReport> cluster) {
    _mapController.move(cluster.center, (_zoom + 2).clamp(10, 18).toDouble());
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final mapState = context.watch<MapProvider>();
    final parking = context.watch<ParkingProvider>();
    final location = context.watch<LocationProvider>();

    final clusters = mapState.showReports
        ? clusterByGrid<CityReport>(
            mapState.openReports,
            (r) => r.position,
            zoom: _zoom,
          )
        : const <Cluster<CityReport>>[];

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.cityMapTitle),
        actions: [
          IconButton(
            tooltip: l10n.retry,
            icon: const Icon(Icons.refresh),
            onPressed: () {
              mapState.load();
              parking.loadSpots();
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: location.position,
              initialZoom: AppConstants.defaultMapZoom,
              minZoom: 10,
              maxZoom: 18,
              onPositionChanged: _onPositionChanged,
            ),
            children: [
              const OsmTileLayer(),
              MarkerLayer(
                markers: [
                  if (mapState.showReports)
                    for (final cluster in clusters)
                      cluster.isSingle
                          ? Marker(
                              key: ValueKey('r-${cluster.items.first.id}'),
                              point: cluster.center,
                              width: 36,
                              height: 36,
                              child: GestureDetector(
                                onTap: () => showReportSummarySheet(
                                  context,
                                  cluster.items.first,
                                ),
                                child: ReportMarker(
                                  category: cluster.items.first.category,
                                  status: cluster.items.first.status,
                                ),
                              ),
                            )
                          : Marker(
                              point: cluster.center,
                              width: 44,
                              height: 44,
                              child: Tooltip(
                                message: l10n.clusterZoomHint(
                                  cluster.items.length,
                                ),
                                child: GestureDetector(
                                  onTap: () => _zoomInto(cluster),
                                  child: _ClusterBubble(
                                    count: cluster.items.length,
                                  ),
                                ),
                              ),
                            ),
                  if (mapState.showParking)
                    for (final scored in parking.rankedSpots)
                      Marker(
                        key: ValueKey('p-${scored.spot.id}'),
                        point: scored.spot.position,
                        width: 38,
                        height: 38,
                        child: GestureDetector(
                          onTap: () =>
                              showSpotDetailSheet(context, scored.spot.id),
                          child: ParkingMarker(spot: scored.spot),
                        ),
                      ),
                  Marker(
                    point: location.position,
                    width: 36,
                    height: 36,
                    child: UserLocationMarker(isFallback: location.isFallback),
                  ),
                ],
              ),
              const OsmAttribution(),
            ],
          ),
          Positioned(
            top: Spacing.md,
            left: Spacing.md,
            right: Spacing.md,
            child: Wrap(
              spacing: Spacing.sm,
              runSpacing: Spacing.sm,
              children: [
                FilterChip(
                  avatar: const Icon(Icons.local_parking, size: 18),
                  label: Text(l10n.layerParking),
                  selected: mapState.showParking,
                  onSelected: mapState.toggleParking,
                ),
                FilterChip(
                  avatar: const Icon(Icons.campaign_outlined, size: 18),
                  label: Text(l10n.layerReports),
                  selected: mapState.showReports,
                  onSelected: mapState.toggleReports,
                ),
              ],
            ),
          ),
          if (mapState.showParking)
            const Positioned(
              left: Spacing.md,
              bottom: 48,
              child: _AvailabilityLegend(),
            ),
          if (mapState.status == ViewStatus.loading)
            const Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: LinearProgressIndicator(),
            ),
          if (mapState.status == ViewStatus.error)
            Positioned(
              left: Spacing.lg,
              right: Spacing.lg,
              bottom: 120,
              child: Card(
                child: SizedBox(
                  height: 220,
                  child: ErrorView(onRetry: mapState.load),
                ),
              ),
            ),
        ],
      ),
      floatingActionButton: FloatingActionButton.small(
        heroTag: 'map-locate',
        tooltip: l10n.useMyLocation,
        onPressed: () async {
          await location.refresh();
          _mapController.move(location.position, 15);
        },
        child: const Icon(Icons.my_location),
      ),
    );
  }
}

class _ClusterBubble extends StatelessWidget {
  const _ClusterBubble({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      decoration: BoxDecoration(
        color: scheme.tertiary,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 3),
        boxShadow: const [
          BoxShadow(blurRadius: 6, color: Colors.black26, offset: Offset(0, 2)),
        ],
      ),
      alignment: Alignment.center,
      child: Text(
        '$count',
        style: TextStyle(color: scheme.onTertiary, fontWeight: FontWeight.w800),
      ),
    );
  }
}

class _AvailabilityLegend extends StatelessWidget {
  const _AvailabilityLegend();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final entries = [
      (AppColors.availabilityHigh, l10n.availabilityHigh),
      (AppColors.availabilityMedium, l10n.availabilityMedium),
      (AppColors.availabilityLow, l10n.availabilityLow),
      (AppColors.availabilityNone, l10n.availabilityNone),
    ];
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(Spacing.sm),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            for (final (color, label) in entries)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.circle, size: 10, color: color),
                    const SizedBox(width: Spacing.xs),
                    Text(label, style: Theme.of(context).textTheme.labelSmall),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
