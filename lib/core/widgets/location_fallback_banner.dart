import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../providers/location_provider.dart';
import '../constants/app_constants.dart';
import '../utils/l10n_ext.dart';

/// Shown when GPS is unavailable and results use Skopje center.
class LocationFallbackBanner extends StatelessWidget {
  const LocationFallbackBanner({super.key});

  @override
  Widget build(BuildContext context) {
    final location = context.watch<LocationProvider>();
    if (!location.isFallback) return const SizedBox.shrink();
    final scheme = Theme.of(context).colorScheme;
    return Material(
      color: scheme.tertiaryContainer,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: Spacing.md,
          vertical: Spacing.sm,
        ),
        child: Row(
          children: [
            Icon(
              Icons.location_off_outlined,
              color: scheme.onTertiaryContainer,
            ),
            const SizedBox(width: Spacing.sm),
            Expanded(
              child: Text(
                context.l10n.locationFallback,
                style: TextStyle(color: scheme.onTertiaryContainer),
              ),
            ),
            TextButton(
              onPressed: () async {
                await location.openSettings();
                await location.refresh();
              },
              child: Text(context.l10n.locationEnable),
            ),
          ],
        ),
      ),
    );
  }
}
