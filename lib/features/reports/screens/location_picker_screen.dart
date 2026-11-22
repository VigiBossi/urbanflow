import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../core/widgets/osm_layers.dart';
import '../../../data/mock/skopje_data.dart';
import '../../../providers/location_provider.dart';

/// Full-screen map to pick a report location. Pops with the chosen [LatLng].
class LocationPickerScreen extends StatefulWidget {
  const LocationPickerScreen({super.key, this.initial});

  final LatLng? initial;

  @override
  State<LocationPickerScreen> createState() => _LocationPickerScreenState();
}

class _LocationPickerScreenState extends State<LocationPickerScreen> {
  final _mapController = MapController();
  LatLng? _picked;

  @override
  void initState() {
    super.initState();
    _picked = widget.initial;
  }

  Future<void> _useGps() async {
    final location = context.read<LocationProvider>();
    await location.refresh();
    if (!mounted) return;
    setState(() => _picked = location.position);
    _mapController.move(location.position, 16);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final picked = _picked;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.pickLocationTitle),
        actions: [
          IconButton(
            tooltip: l10n.useMyLocation,
            onPressed: _useGps,
            icon: const Icon(Icons.my_location),
          ),
        ],
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: widget.initial ?? AppConstants.skopjeCenter,
              initialZoom: 15,
              minZoom: 10,
              maxZoom: 18,
              onTap: (_, point) => setState(() => _picked = point),
            ),
            children: [
              const OsmTileLayer(),
              if (picked != null)
                MarkerLayer(
                  markers: [
                    Marker(
                      point: picked,
                      width: 48,
                      height: 48,
                      alignment: Alignment.topCenter,
                      child: Icon(
                        Icons.location_on,
                        size: 48,
                        color: Theme.of(context).colorScheme.error,
                      ),
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
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(Spacing.md),
                child: Row(
                  children: [
                    const Icon(Icons.touch_app_outlined),
                    const SizedBox(width: Spacing.sm),
                    Expanded(
                      child: Text(
                        picked == null
                            ? l10n.tapToPlace
                            : SkopjeData.neighborhoodFor(picked),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(Spacing.lg),
          child: FilledButton.icon(
            onPressed: picked == null
                ? null
                : () => Navigator.of(context).pop(picked),
            icon: const Icon(Icons.check),
            label: Text(l10n.confirmLocation),
          ),
        ),
      ),
    );
  }
}
