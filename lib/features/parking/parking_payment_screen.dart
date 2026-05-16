import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../core/models/parking_spot_model.dart';
import '../../core/models/payment_model.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/providers/payment_provider.dart';
import '../../shared/widgets/gradient_button.dart';

class ParkingPaymentScreen extends StatefulWidget {
  final ParkingSpot spot;
  const ParkingPaymentScreen({super.key, required this.spot});

  @override
  State<ParkingPaymentScreen> createState() => _ParkingPaymentScreenState();
}

class _ParkingPaymentScreenState extends State<ParkingPaymentScreen> {
  int _durationMinutes = 60;
  PaymentMethod _method = PaymentMethod.card;
  final _plateCtrl = TextEditingController();

  @override
  void dispose() {
    _plateCtrl.dispose();
    super.dispose();
  }

  double get _total =>
      context.read<PaymentProvider>().calculateTotal(
          widget.spot.pricePerHour, _durationMinutes);

  Future<void> _pay() async {
    final auth = context.read<AuthProvider>();
    final payment = context.read<PaymentProvider>();
    final l10n = AppLocalizations.of(context);

    final success = await payment.startSession(
      spot: widget.spot,
      userId: auth.user!.id,
      durationMinutes: _durationMinutes,
      method: _method,
      licensePlate: _plateCtrl.text.trim().isNotEmpty
          ? _plateCtrl.text.trim()
          : null,
    );

    if (success && mounted) {
      auth.incrementSessions();
      _showSuccessSheet(l10n);
    }
  }

  void _showSuccessSheet(AppLocalizations l10n) {
    showModalBottomSheet(
      context: context,
      isDismissible: false,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppColors.success.withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle,
                  color: AppColors.success, size: 40),
            ),
            const SizedBox(height: 16),
            Text(l10n.paymentSuccess,
                style: const TextStyle(
                    fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('You\'re parked at ${widget.spot.name}',
                style: TextStyle(color: Colors.grey[600])),
            Text('For $_durationMinutes minutes • \$${_total.toStringAsFixed(2)} paid',
                style: TextStyle(color: Colors.grey[600], fontSize: 13)),
            const SizedBox(height: 24),
            GradientButton(
              label: 'Done',
              onPressed: () {
                Navigator.of(context).popUntil((r) => r.isFirst);
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final isLoading = context.watch<PaymentProvider>().isLoading;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.payNow),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      backgroundColor: const Color(0xFFF5F7FF),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildSpotCard(),
            const SizedBox(height: 16),
            _buildDurationSelector(l10n),
            const SizedBox(height: 16),
            _buildLicensePlateField(l10n),
            const SizedBox(height: 16),
            _buildPaymentMethodSelector(l10n),
            const SizedBox(height: 16),
            _buildSummaryCard(l10n),
            const SizedBox(height: 24),
            GradientButton(
              label: '${l10n.confirmPayment} • \$${_total.toStringAsFixed(2)}',
              onPressed: isLoading ? null : _pay,
              isLoading: isLoading,
              icon: Icons.payment,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSpotCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 3)),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: widget.spot.statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(Icons.local_parking,
                color: widget.spot.statusColor, size: 28),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(widget.spot.name,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 15)),
                Text(widget.spot.address,
                    style: TextStyle(
                        fontSize: 12, color: Colors.grey[600]),
                    overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
          Text(widget.spot.formattedPrice,
              style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                  fontSize: 14)),
        ],
      ),
    );
  }

  Widget _buildDurationSelector(AppLocalizations l10n) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(l10n.duration,
              style: const TextStyle(
                  fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                onPressed: _durationMinutes > 30
                    ? () => setState(
                        () => _durationMinutes -= 30)
                    : null,
                icon: const Icon(Icons.remove_circle_outline,
                    size: 32),
                color: AppColors.primary,
              ),
              const SizedBox(width: 16),
              Column(
                children: [
                  Text(
                    _durationMinutes >= 60
                        ? '${_durationMinutes ~/ 60}h ${_durationMinutes % 60 > 0 ? "${_durationMinutes % 60}m" : ""}'
                        : '${_durationMinutes}m',
                    style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary),
                  ),
                  Text(l10n.duration,
                      style: TextStyle(
                          fontSize: 12, color: Colors.grey[600])),
                ],
              ),
              const SizedBox(width: 16),
              IconButton(
                onPressed: _durationMinutes < 24 * 60
                    ? () => setState(
                        () => _durationMinutes += 30)
                    : null,
                icon: const Icon(Icons.add_circle_outline,
                    size: 32),
                color: AppColors.primary,
              ),
            ],
          ),
          const SizedBox(height: 14),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [30, 60, 90, 120, 180, 240].map((mins) {
                final selected = _durationMinutes == mins;
                return GestureDetector(
                  onTap: () =>
                      setState(() => _durationMinutes = mins),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: selected
                          ? AppColors.primary
                          : AppColors.primary.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      mins < 60
                          ? '${mins}m'
                          : '${mins ~/ 60}h',
                      style: TextStyle(
                          color: selected
                              ? Colors.white
                              : AppColors.primary,
                          fontWeight: FontWeight.w600,
                          fontSize: 13),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLicensePlateField(AppLocalizations l10n) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 3)),
        ],
      ),
      child: TextFormField(
        controller: _plateCtrl,
        textCapitalization: TextCapitalization.characters,
        decoration: InputDecoration(
          labelText: l10n.licensePlate,
          hintText: 'SK-1234-AB (optional)',
          prefixIcon: const Icon(Icons.directions_car_outlined),
          border: InputBorder.none,
          enabledBorder: InputBorder.none,
          focusedBorder: InputBorder.none,
        ),
      ),
    );
  }

  Widget _buildPaymentMethodSelector(AppLocalizations l10n) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(l10n.paymentMethod,
              style: const TextStyle(
                  fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 12),
          ...PaymentMethod.values.map((m) => _MethodTile(
                method: m,
                selected: _method == m,
                onTap: () => setState(() => _method = m),
              )),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(AppLocalizations l10n) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.06),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
            color: AppColors.primary.withOpacity(0.2)),
      ),
      child: Column(
        children: [
          _SummaryRow(l10n.pricePerHour,
              widget.spot.formattedPrice),
          _SummaryRow(
              l10n.duration,
              _durationMinutes >= 60
                  ? '${_durationMinutes ~/ 60}h ${_durationMinutes % 60 > 0 ? "${_durationMinutes % 60}m" : ""}'
                  : '${_durationMinutes}m'),
          const Divider(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(l10n.totalAmount,
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 16)),
              Text('\$${_total.toStringAsFixed(2)}',
                  style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                      color: AppColors.primary)),
            ],
          ),
        ],
      ),
    );
  }
}

class _MethodTile extends StatelessWidget {
  final PaymentMethod method;
  final bool selected;
  final VoidCallback onTap;

  const _MethodTile({
    required this.method,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final labels = {
      PaymentMethod.card: ('Credit/Debit Card', Icons.credit_card),
      PaymentMethod.applePay: ('Apple Pay', Icons.apple),
      PaymentMethod.googlePay: ('Google Pay', Icons.payment),
      PaymentMethod.local: ('Local Payment', Icons.account_balance),
      PaymentMethod.cash: ('Cash', Icons.money),
    };

    final info = labels[method]!;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: selected
              ? AppColors.primary.withOpacity(0.1)
              : Colors.grey[50],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color:
                selected ? AppColors.primary : Colors.grey[200]!,
            width: selected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(info.$2,
                color: selected
                    ? AppColors.primary
                    : Colors.grey[600],
                size: 22),
            const SizedBox(width: 12),
            Text(info.$1,
                style: TextStyle(
                    fontWeight: selected
                        ? FontWeight.w700
                        : FontWeight.normal,
                    color: selected
                        ? AppColors.primary
                        : Colors.black87)),
            const Spacer(),
            if (selected)
              const Icon(Icons.check_circle,
                  color: AppColors.primary, size: 20),
          ],
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  const _SummaryRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          Text(value,
              style: const TextStyle(
                  fontWeight: FontWeight.w600, fontSize: 13)),
        ],
      ),
    );
  }
}
