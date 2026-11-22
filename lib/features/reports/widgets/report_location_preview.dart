import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:material_ui/material_ui.dart';

import '../../../core/widgets/osm_layers.dart';
import '../../../data/models/city_report.dart';
import 'report_marker.dart';

/// Small non-interactive map showing a single report location.
class ReportLocationPreview extends StatelessWidget {
  const ReportLocationPreview({
    super.key,
    required this.position,
    this.category,
    this.height = 180,
  });

  final LatLng position;
  final ReportCategory? category;
  final double height;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: SizedBox(
        height: height,
        child: FlutterMap(
          key: ValueKey(position),
          options: MapOptions(
            initialCenter: position,
            initialZoom: 15.5,
            interactionOptions: const InteractionOptions(
              flags: InteractiveFlag.none,
            ),
          ),
          children: [
            const OsmTileLayer(),
            MarkerLayer(
              markers: [
                Marker(
                  point: position,
                  width: 40,
                  height: 40,
                  child: category == null
                      ? Icon(
                          Icons.location_on,
                          size: 40,
                          color: Theme.of(context).colorScheme.error,
                        )
                      : ReportMarker(category: category!),
                ),
              ],
            ),
            const OsmAttribution(),
          ],
        ),
      ),
    );
  }
}
