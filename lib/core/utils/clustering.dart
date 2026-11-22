import 'dart:math' as math;

import 'package:latlong2/latlong.dart';

/// A group of nearby items rendered as one marker.
class Cluster<T> {
  Cluster(this.items, this.center);

  final List<T> items;
  final LatLng center;

  bool get isSingle => items.length == 1;
}

/// Simple grid-based clustering in Web Mercator pixel space.
///
/// Items whose projected positions fall in the same [cellSizePx] square at
/// the given [zoom] are merged. Cheap enough for a few hundred markers.
List<Cluster<T>> clusterByGrid<T>(
  Iterable<T> items,
  LatLng Function(T) positionOf, {
  required double zoom,
  double cellSizePx = 64,
}) {
  final scale = 256 * math.pow(2, zoom);
  final cells = <(int, int), List<T>>{};
  for (final item in items) {
    final p = positionOf(item);
    final x = (p.longitude + 180) / 360 * scale;
    final sinLat = math.sin(p.latitude * math.pi / 180);
    final y =
        (0.5 - math.log((1 + sinLat) / (1 - sinLat)) / (4 * math.pi)) * scale;
    final key = ((x / cellSizePx).floor(), (y / cellSizePx).floor());
    cells.putIfAbsent(key, () => []).add(item);
  }
  return [
    for (final group in cells.values)
      Cluster<T>(
        group,
        LatLng(
          group.map((e) => positionOf(e).latitude).reduce((a, b) => a + b) /
              group.length,
          group.map((e) => positionOf(e).longitude).reduce((a, b) => a + b) /
              group.length,
        ),
      ),
  ];
}
