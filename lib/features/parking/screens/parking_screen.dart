import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../core/widgets/location_fallback_banner.dart';
import '../../../core/widgets/responsive.dart';
import '../../../core/widgets/state_views.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../../../providers/location_provider.dart';
import '../../../providers/parking_provider.dart';
import '../../../providers/view_status.dart';
import '../widgets/parking_map_view.dart';
import '../widgets/parking_spot_card.dart';
import '../widgets/spot_detail_sheet.dart';

enum _ParkingView { list, map }

/// AI Parking: ranked list and map of nearby spots.
class ParkingScreen extends StatefulWidget {
  const ParkingScreen({super.key});

  @override
  State<ParkingScreen> createState() => _ParkingScreenState();
}

class _ParkingScreenState extends State<ParkingScreen> {
  _ParkingView _view = _ParkingView.list;
  String? _selectedId;

  void _openSpot(String id) {
    setState(() => _selectedId = id);
    showSpotDetailSheet(context, id);
  }

  Future<void> _refresh() async {
    await Future.wait([
      context.read<LocationProvider>().refresh(),
      context.read<ParkingProvider>().loadSpots(),
    ]);
  }

  static String _presetLabel(AppLocalizations l10n, RankingPreset preset) =>
      switch (preset) {
        RankingPreset.balanced => l10n.presetBalanced,
        RankingPreset.closest => l10n.presetClosest,
        RankingPreset.cheapest => l10n.presetCheapest,
        RankingPreset.mostAvailable => l10n.presetAvailable,
      };

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final parking = context.watch<ParkingProvider>();
    final wide = Responsive.isExpanded(context);
    final updated = parking.lastUpdated;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(l10n.parkingTitle),
            Text(
              updated == null
                  ? l10n.parkingSubtitle
                  : l10n.lastUpdated(Formatters(l10n).time(updated)),
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: l10n.useMyLocation,
            icon: const Icon(Icons.my_location),
            onPressed: () => context.read<LocationProvider>().refresh(),
          ),
          IconButton(
            tooltip: l10n.retry,
            icon: const Icon(Icons.refresh),
            onPressed: _refresh,
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(
              Spacing.lg,
              0,
              Spacing.lg,
              Spacing.sm,
            ),
            child: Column(
              children: [
                const LocationFallbackBanner(),
                const SizedBox(height: Spacing.sm),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      for (final preset in RankingPreset.values)
                        Padding(
                          padding: const EdgeInsets.only(right: Spacing.sm),
                          child: ChoiceChip(
                            label: Text(_presetLabel(l10n, preset)),
                            selected: parking.preset == preset,
                            onSelected: (_) => parking.setPreset(preset),
                          ),
                        ),
                    ],
                  ),
                ),
                if (!wide) ...[
                  const SizedBox(height: Spacing.sm),
                  SizedBox(
                    width: double.infinity,
                    child: SegmentedButton<_ParkingView>(
                      segments: [
                        ButtonSegment(
                          value: _ParkingView.list,
                          icon: const Icon(Icons.list),
                          label: Text(l10n.listView),
                        ),
                        ButtonSegment(
                          value: _ParkingView.map,
                          icon: const Icon(Icons.map_outlined),
                          label: Text(l10n.mapView),
                        ),
                      ],
                      selected: {_view},
                      onSelectionChanged: (s) =>
                          setState(() => _view = s.first),
                    ),
                  ),
                ],
              ],
            ),
          ),
          Expanded(child: _buildContent(context, parking, wide)),
        ],
      ),
    );
  }

  Widget _buildContent(
    BuildContext context,
    ParkingProvider parking,
    bool wide,
  ) {
    final l10n = context.l10n;
    if (parking.status == ViewStatus.error && parking.spots.isEmpty) {
      return ErrorView(onRetry: _refresh);
    }
    if (parking.status != ViewStatus.ready && parking.spots.isEmpty) {
      return const LoadingView();
    }
    if (parking.rankedSpots.isEmpty) {
      return EmptyView(
        icon: Icons.local_parking,
        title: l10n.noSpotsTitle,
        message: l10n.noSpotsMessage,
      );
    }

    final list = RefreshIndicator(
      onRefresh: _refresh,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(
          Spacing.lg,
          Spacing.sm,
          Spacing.lg,
          Spacing.xl,
        ),
        itemCount: parking.rankedSpots.length,
        separatorBuilder: (_, _) => const SizedBox(height: Spacing.sm),
        itemBuilder: (context, i) {
          final scored = parking.rankedSpots[i];
          return ParkingSpotCard(
            key: ValueKey(scored.spot.id),
            scored: scored,
            isTopPick: i == 0 && !scored.spot.isFull,
            selected: wide && scored.spot.id == _selectedId,
            onTap: () => _openSpot(scored.spot.id),
          );
        },
      ),
    );
    final map = ParkingMapView(onSpotTap: _openSpot, selectedId: _selectedId);

    if (wide) {
      return Row(
        children: [
          SizedBox(width: 420, child: list),
          const VerticalDivider(width: 1),
          Expanded(child: map),
        ],
      );
    }
    return _view == _ParkingView.list ? list : map;
  }
}
