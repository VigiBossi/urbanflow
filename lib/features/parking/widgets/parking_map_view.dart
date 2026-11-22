import 'package:flutter_map/flutter_map.dart';
import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/widgets/osm_layers.dart';
import '../../../providers/location_provider.dart';
import '../../../providers/parking_provider.dart';
import 'parking_marker.dart';

/// Map of ranked parking spots around the user.
class ParkingMapView extends StatelessWidget {
  const ParkingMapView({super.key, required this.onSpotTap, this.selectedId});

  final ValueChanged<String> onSpotTap;
  final String? selectedId;

  @override
  Widget build(BuildContext context) {
    final parking = context.watch<ParkingProvider>();
    final location = context.watch<LocationProvider>();
    return FlutterMap(
      options: MapOptions(
        initialCenter: location.position,
        initialZoom: AppConstants.defaultMapZoom,
        minZoom: 10,
        maxZoom: 18,
      ),
      children: [
        const OsmTileLayer(),
        MarkerLayer(
          markers: [
            Marker(
              point: location.position,
              width: 36,
              height: 36,
              child: UserLocationMarker(isFallback: location.isFallback),
            ),
            for (final scored in parking.rankedSpots)
              Marker(
                key: ValueKey(scored.spot.id),
                point: scored.spot.position,
                width: 40,
                height: 40,
                child: GestureDetector(
                  onTap: () => onSpotTap(scored.spot.id),
                  child: ParkingMarker(
                    spot: scored.spot,
                    highlighted: scored.spot.id == selectedId,
                  ),
                ),
              ),
          ],
        ),
        const OsmAttribution(),
      ],
    );
  }
}
