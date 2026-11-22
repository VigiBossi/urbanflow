import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/routing/app_router.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../providers/parking_provider.dart';

/// Shows a dialog when the active parking session has 10 minutes left or has
/// expired. Must be placed once, inside the shell.
class ParkingAlertListener extends StatefulWidget {
  const ParkingAlertListener({super.key});

  @override
  State<ParkingAlertListener> createState() => _ParkingAlertListenerState();
}

class _ParkingAlertListenerState extends State<ParkingAlertListener> {
  ParkingProvider? _parking;
  bool _showing = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final parking = context.read<ParkingProvider>();
    if (!identical(parking, _parking)) {
      _parking?.removeListener(_onChange);
      _parking = parking..addListener(_onChange);
      WidgetsBinding.instance.addPostFrameCallback((_) => _onChange());
    }
  }

  @override
  void dispose() {
    _parking?.removeListener(_onChange);
    super.dispose();
  }

  void _onChange() {
    final parking = _parking;
    if (parking == null || _showing || !mounted) return;
    final alert = parking.pendingAlert;
    if (alert == ParkingAlert.none) return;
    final spot = parking.activeSession?.spotName ?? '';
    _showing = true;
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (!mounted) return;
      final l10n = context.l10n;
      final expired = alert == ParkingAlert.expired;
      final openSession = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          icon: Icon(
            expired ? Icons.timer_off_outlined : Icons.timer_outlined,
            color: expired ? Theme.of(context).colorScheme.error : null,
          ),
          title: Text(
            expired ? l10n.sessionExpiredTitle : l10n.sessionWarningTitle,
          ),
          content: Text(
            expired
                ? l10n.sessionExpiredMessage(spot)
                : l10n.sessionWarningMessage(spot),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: Text(l10n.ok),
            ),
            if (!expired)
              FilledButton(
                onPressed: () => Navigator.pop(context, true),
                child: Text(l10n.extend),
              ),
          ],
        ),
      );
      parking.acknowledgeAlert();
      _showing = false;
      if (openSession == true && mounted) {
        await Navigator.of(context).pushNamed(AppRoutes.activeSession);
      }
    });
  }

  @override
  Widget build(BuildContext context) => const SizedBox.shrink();
}
