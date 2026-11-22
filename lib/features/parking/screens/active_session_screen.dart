import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../core/widgets/responsive.dart';
import '../../../core/widgets/state_views.dart';
import '../../../data/models/parking_session.dart';
import '../../../providers/parking_provider.dart';

/// Live countdown for the active parking session.
class ActiveSessionScreen extends StatelessWidget {
  const ActiveSessionScreen({super.key});

  Future<void> _extend(BuildContext context, ParkingSession session) async {
    final l10n = context.l10n;
    final fmt = Formatters(l10n);
    final parking = context.read<ParkingProvider>();
    final messenger = ScaffoldMessenger.of(context);
    final extra = await showModalBottomSheet<Duration>(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.only(bottom: Spacing.sm),
              child: Text(
                l10n.extendTitle,
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ),
            for (final d in AppConstants.extensionDurations)
              ListTile(
                leading: const Icon(Icons.more_time),
                title: Text(
                  l10n.extendOption(
                    fmt.duration(d),
                    fmt.money(ParkingSession.costFor(d, session.pricePerHour)),
                  ),
                ),
                onTap: () => Navigator.pop(context, d),
              ),
            const SizedBox(height: Spacing.md),
          ],
        ),
      ),
    );
    if (extra == null) return;
    try {
      await parking.extendSession(extra);
      messenger.showSnackBar(SnackBar(content: Text(l10n.sessionExtended)));
    } on Exception {
      messenger.showSnackBar(SnackBar(content: Text(l10n.networkError)));
    }
  }

  Future<void> _end(BuildContext context) async {
    final l10n = context.l10n;
    final parking = context.read<ParkingProvider>();
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.endSession),
        content: Text(l10n.endSessionConfirm),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(l10n.cancel),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(l10n.endSession),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await parking.endSession();
      messenger.showSnackBar(SnackBar(content: Text(l10n.sessionEnded)));
      if (navigator.canPop()) navigator.pop();
    } on Exception {
      messenger.showSnackBar(SnackBar(content: Text(l10n.networkError)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = Formatters(l10n);
    final theme = Theme.of(context);
    final parking = context.watch<ParkingProvider>();
    final session = parking.activeSession;

    if (session == null) {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.activeSessionTitle)),
        body: EmptyView(
          icon: Icons.local_parking,
          title: l10n.noActiveSessionTitle,
          message: l10n.noActiveSessionMessage,
        ),
      );
    }

    final now = parking.now;
    final remaining = session.remaining(now);
    final expired = !session.isActive || remaining == Duration.zero;
    final warning = parking.isInWarningWindow;
    final ringColor = expired || warning
        ? theme.colorScheme.error
        : theme.colorScheme.primary;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.activeSessionTitle)),
      body: ListView(
        padding: EdgeInsets.all(Responsive.pagePadding(context)),
        children: [
          MaxWidthBox(
            maxWidth: 520,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (warning)
                  Padding(
                    padding: const EdgeInsets.only(bottom: Spacing.lg),
                    child: MaterialBanner(
                      backgroundColor: theme.colorScheme.errorContainer,
                      leading: Icon(
                        Icons.timer_outlined,
                        color: theme.colorScheme.onErrorContainer,
                      ),
                      content: Text(
                        l10n.sessionWarningMessage(session.spotName),
                        style: TextStyle(
                          color: theme.colorScheme.onErrorContainer,
                        ),
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => _extend(context, session),
                          child: Text(l10n.extend),
                        ),
                      ],
                    ),
                  ),
                Text(
                  session.spotName,
                  style: theme.textTheme.titleLarge,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: Spacing.xl),
                Center(
                  child: SizedBox.square(
                    dimension: 240,
                    child: Stack(
                      alignment: Alignment.center,
                      fit: StackFit.expand,
                      children: [
                        CircularProgressIndicator(
                          value: 1 - session.progress(now),
                          strokeWidth: 12,
                          strokeCap: StrokeCap.round,
                          color: ringColor,
                          backgroundColor:
                              theme.colorScheme.surfaceContainerHighest,
                        ),
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              expired
                                  ? l10n.sessionExpiredBadge
                                  : l10n.timeRemaining,
                              style: theme.textTheme.labelLarge,
                            ),
                            const SizedBox(height: Spacing.xs),
                            Text(
                              Formatters.countdown(remaining),
                              key: const Key('session-countdown'),
                              style: theme.textTheme.displaySmall?.copyWith(
                                fontWeight: FontWeight.w700,
                                fontFeatures: const [
                                  FontFeature.tabularFigures(),
                                ],
                                color: ringColor,
                              ),
                            ),
                            const SizedBox(height: Spacing.xs),
                            Text(
                              l10n.endsAt(fmt.time(session.endTime)),
                              style: theme.textTheme.bodySmall,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: Spacing.xl),
                Card(
                  child: Column(
                    children: [
                      _InfoRow(
                        icon: Icons.directions_car_outlined,
                        label: l10n.plateLabel,
                        value: session.plate,
                      ),
                      _InfoRow(
                        icon: Icons.play_circle_outline,
                        label: l10n.startedAt,
                        value: fmt.time(session.startTime),
                      ),
                      _InfoRow(
                        icon: Icons.receipt_long_outlined,
                        label: l10n.amountPaid,
                        value: session.amountPaid <= 0
                            ? l10n.priceFree
                            : fmt.money(session.amountPaid),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: Spacing.xl),
                if (!expired)
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: parking.isBusy
                              ? null
                              : () => _end(context),
                          icon: const Icon(Icons.stop_circle_outlined),
                          label: Text(l10n.endSession),
                        ),
                      ),
                      const SizedBox(width: Spacing.md),
                      Expanded(
                        child: FilledButton.icon(
                          onPressed: parking.isBusy
                              ? null
                              : () => _extend(context, session),
                          icon: const Icon(Icons.more_time),
                          label: Text(l10n.extend),
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => ListTile(
    leading: Icon(icon),
    title: Text(label),
    trailing: Text(value, style: Theme.of(context).textTheme.titleSmall),
  );
}
