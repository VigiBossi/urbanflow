import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/routing/app_router.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../core/utils/validators.dart';
import '../../../core/widgets/responsive.dart';
import '../../../data/models/parking_session.dart';
import '../../../data/models/parking_spot.dart';
import '../../../data/repositories/parking_repository.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../../../providers/parking_provider.dart';
import '../widgets/availability_badge.dart';

/// Mock payment flow: choose duration, plate and method, then confirm.
class PaymentScreen extends StatefulWidget {
  const PaymentScreen({super.key, required this.spot});

  final ParkingSpot spot;

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _plateController = TextEditingController();
  Duration _duration = AppConstants.parkingDurations[1];
  PaymentMethod _method = PaymentMethod.card;

  @override
  void dispose() {
    _plateController.dispose();
    super.dispose();
  }

  static String _methodLabel(AppLocalizations l10n, PaymentMethod m) =>
      switch (m) {
        PaymentMethod.card => l10n.paymentCard,
        PaymentMethod.mobileWallet => l10n.paymentWallet,
        PaymentMethod.sms => l10n.paymentSms,
      };

  static IconData _methodIcon(PaymentMethod m) => switch (m) {
    PaymentMethod.card => Icons.credit_card,
    PaymentMethod.mobileWallet => Icons.account_balance_wallet_outlined,
    PaymentMethod.sms => Icons.sms_outlined,
  };

  Future<void> _confirm() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    final l10n = context.l10n;
    final parking = context.read<ParkingProvider>();
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);
    try {
      await parking.startSession(
        spot: widget.spot,
        duration: _duration,
        plate: _plateController.text,
        method: _method,
      );
      messenger.showSnackBar(SnackBar(content: Text(l10n.paymentSuccess)));
      await navigator.pushReplacementNamed(AppRoutes.activeSession);
    } on ParkingException catch (e) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            e.code == 'spotFull' ? l10n.spotFullError : l10n.networkError,
          ),
        ),
      );
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
    final spot = widget.spot;
    final total = ParkingSession.costFor(_duration, spot.pricePerHour);
    final busy = parking.isBusy;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.paymentTitle)),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: EdgeInsets.all(Responsive.pagePadding(context)),
          children: [
            MaxWidthBox(
              maxWidth: 560,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Card(
                    child: ListTile(
                      contentPadding: const EdgeInsets.all(Spacing.md),
                      leading: const Icon(Icons.local_parking, size: 32),
                      title: Text(spot.name),
                      subtitle: Padding(
                        padding: const EdgeInsets.only(top: Spacing.xs),
                        child: Wrap(
                          spacing: Spacing.sm,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            AvailabilityBadge(spot: spot),
                            Text(fmt.pricePerHour(spot.pricePerHour)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  if (parking.activeSession?.isActive ?? false) ...[
                    const SizedBox(height: Spacing.md),
                    Text(
                      l10n.replaceSessionWarning,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.error,
                      ),
                    ),
                  ],
                  const SizedBox(height: Spacing.xl),
                  Text(l10n.selectDuration, style: theme.textTheme.titleSmall),
                  const SizedBox(height: Spacing.sm),
                  Wrap(
                    spacing: Spacing.sm,
                    runSpacing: Spacing.sm,
                    children: [
                      for (final d in AppConstants.parkingDurations)
                        ChoiceChip(
                          label: Text(fmt.duration(d)),
                          selected: _duration == d,
                          onSelected: busy
                              ? null
                              : (_) => setState(() => _duration = d),
                        ),
                    ],
                  ),
                  const SizedBox(height: Spacing.xl),
                  TextFormField(
                    controller: _plateController,
                    enabled: !busy,
                    textCapitalization: TextCapitalization.characters,
                    decoration: InputDecoration(
                      labelText: l10n.plateLabel,
                      hintText: l10n.plateHint,
                      prefixIcon: const Icon(Icons.directions_car_outlined),
                    ),
                    validator: (v) => switch (Validators.plate(v)) {
                      ValidationError.required => l10n.plateRequired,
                      ValidationError.invalid => l10n.plateInvalid,
                      _ => null,
                    },
                  ),
                  const SizedBox(height: Spacing.xl),
                  Text(l10n.paymentMethod, style: theme.textTheme.titleSmall),
                  const SizedBox(height: Spacing.sm),
                  SegmentedButton<PaymentMethod>(
                    showSelectedIcon: false,
                    segments: [
                      for (final m in PaymentMethod.values)
                        ButtonSegment(
                          value: m,
                          icon: Icon(_methodIcon(m)),
                          tooltip: _methodLabel(l10n, m),
                        ),
                    ],
                    selected: {_method},
                    onSelectionChanged: busy
                        ? null
                        : (s) => setState(() => _method = s.first),
                  ),
                  const SizedBox(height: Spacing.xs),
                  Text(
                    _methodLabel(l10n, _method),
                    textAlign: TextAlign.center,
                    style: theme.textTheme.bodySmall,
                  ),
                  const SizedBox(height: Spacing.xl),
                  Card(
                    color: theme.colorScheme.secondaryContainer,
                    child: Padding(
                      padding: const EdgeInsets.all(Spacing.lg),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              l10n.totalLabel,
                              style: theme.textTheme.titleMedium,
                            ),
                          ),
                          Text(
                            total <= 0 ? l10n.priceFree : fmt.money(total),
                            style: theme.textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: Spacing.sm),
                  Row(
                    children: [
                      Icon(
                        Icons.info_outline,
                        size: 16,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: Spacing.xs),
                      Expanded(
                        child: Text(
                          l10n.mockPaymentNotice,
                          style: theme.textTheme.bodySmall,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: Spacing.xl),
                  FilledButton.icon(
                    onPressed: busy || spot.isFull ? null : _confirm,
                    icon: busy
                        ? const SizedBox.square(
                            dimension: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.lock_outline),
                    label: Text(
                      total <= 0
                          ? l10n.startFreeSession
                          : l10n.payAmount(fmt.money(total)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
