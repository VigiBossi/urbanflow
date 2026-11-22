import 'package:flutter_map/flutter_map.dart' show TileLayer;
import 'package:material_ui/material_ui.dart';

import '../constants/app_constants.dart';
import '../utils/l10n_ext.dart';

/// OpenStreetMap tile layer configured per the OSM tile usage policy.
class OsmTileLayer extends StatelessWidget {
  const OsmTileLayer({super.key});

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final tiles = TileLayer(
      urlTemplate: AppConstants.osmTileUrl,
      userAgentPackageName: AppConstants.tileUserAgentPackage,
      maxZoom: 19,
    );
    if (!dark) return tiles;
    // Dim tiles in dark mode for comfort.
    return ColorFiltered(
      colorFilter: const ColorFilter.matrix([
        0.6, 0, 0, 0, 0, //
        0, 0.6, 0, 0, 0,
        0, 0, 0.6, 0, 0,
        0, 0, 0, 1, 0,
      ]),
      child: tiles,
    );
  }
}

/// Required "© OpenStreetMap contributors" attribution, rendered with
/// material_ui widgets (flutter_map's built-in attribution widgets still
/// depend on the legacy `package:flutter/material.dart`).
class OsmAttribution extends StatelessWidget {
  const OsmAttribution({super.key});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Align(
      alignment: Alignment.bottomRight,
      child: Container(
        margin: const EdgeInsets.all(4),
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(
          color: scheme.surface.withValues(alpha: 0.85),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          '© ${context.l10n.mapAttribution}',
          style: Theme.of(context).textTheme.labelSmall
              ?.copyWith(color: scheme.onSurface),
        ),
      ),
    );
  }
}

/// A pulsing-style dot showing the user's position.
class UserLocationMarker extends StatelessWidget {
  const UserLocationMarker({super.key, this.isFallback = false});

  final bool isFallback;

  @override
  Widget build(BuildContext context) {
    final color = isFallback
        ? Theme.of(context).colorScheme.outline
        : Theme.of(context).colorScheme.primary;
    return Container(
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: Container(
        width: 16,
        height: 16,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 3),
        ),
      ),
    );
  }
}
