import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/routing/app_router.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../providers/parking_provider.dart';

/// In-app banner with the live countdown of the active parking session.
class SessionBanner extends StatelessWidget {
  const SessionBanner({super.key});

  @override
  Widget build(BuildContext context) {
    final parking = context.watch<ParkingProvider>();
    final session = parking.activeSession;
    if (session == null || !session.isActive) return const SizedBox.shrink();
    final scheme = Theme.of(context).colorScheme;
    final warning = parking.isInWarningWindow;
    final bg = warning ? scheme.errorContainer : scheme.primaryContainer;
    final fg = warning ? scheme.onErrorContainer : scheme.onPrimaryContainer;

    return Material(
      color: bg,
      child: InkWell(
        onTap: () => Navigator.of(context).pushNamed(AppRoutes.activeSession),
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: Spacing.lg,
            vertical: Spacing.sm,
          ),
          child: Row(
            children: [
              Icon(Icons.local_parking, color: fg),
              const SizedBox(width: Spacing.sm),
              Expanded(
                child: Text(
                  context.l10n.sessionBanner(
                    session.spotName,
                    Formatters.countdown(parking.remaining),
                  ),
                  style: TextStyle(color: fg, fontWeight: FontWeight.w600),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Text(
                context.l10n.viewSession,
                style: TextStyle(color: fg, fontWeight: FontWeight.w700),
              ),
              Icon(Icons.chevron_right, color: fg),
            ],
          ),
        ),
      ),
    );
  }
}
