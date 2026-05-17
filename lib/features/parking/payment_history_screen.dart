import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../core/models/payment_model.dart';
import '../../core/providers/payment_provider.dart';
import '../../core/utils/date_formatter.dart';

class PaymentHistoryScreen extends StatelessWidget {
  const PaymentHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final payment = context.watch<PaymentProvider>();
    final sessions = payment.history;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.paymentHistory),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      backgroundColor: const Color(0xFFF5F7FF),
      body: sessions.isEmpty
          ? _EmptyHistory(l10n: l10n)
          : Column(
              children: [
                _SummaryBanner(sessions: sessions),
                Expanded(
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: sessions.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (_, i) => _SessionCard(session: sessions[i]),
                  ),
                ),
              ],
            ),
    );
  }
}

class _SummaryBanner extends StatelessWidget {
  final List<ParkingSession> sessions;

  const _SummaryBanner({required this.sessions});

  @override
  Widget build(BuildContext context) {
    final total =
        sessions.fold<double>(0, (sum, s) => sum + s.totalAmount);
    final count = sessions.length;
    final totalHours = sessions.fold<int>(
        0, (sum, s) => sum + s.duration.inMinutes ~/ 60);

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primary, Color(0xFF1E88E5)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.35),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          _SumItem(
              label: 'Total Spent',
              value: total.asCurrency,
              icon: Icons.payments_outlined),
          _Divider(),
          _SumItem(
              label: 'Sessions',
              value: '$count',
              icon: Icons.history),
          _Divider(),
          _SumItem(
              label: 'Hours Parked',
              value: '${totalHours}h',
              icon: Icons.access_time),
        ],
      ),
    );
  }
}

class _SumItem extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _SumItem(
      {required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, color: Colors.white70, size: 20),
          const SizedBox(height: 6),
          Text(value,
              style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 18)),
          Text(label,
              style:
                  TextStyle(color: Colors.white.withOpacity(0.75), fontSize: 11),
              textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(width: 1, height: 48, color: Colors.white24);
  }
}

class _SessionCard extends StatelessWidget {
  final ParkingSession session;
  const _SessionCard({required this.session});

  Color get _statusColor {
    switch (session.status) {
      case PaymentStatus.completed:
        return AppColors.success;
      case PaymentStatus.cancelled:
        return AppColors.error;
      case PaymentStatus.expired:
        return AppColors.warning;
      default:
        return AppColors.primary;
    }
  }

  String get _statusLabel {
    switch (session.status) {
      case PaymentStatus.completed:
        return 'Completed';
      case PaymentStatus.cancelled:
        return 'Cancelled';
      case PaymentStatus.expired:
        return 'Expired';
      case PaymentStatus.active:
        return 'Active';
      case PaymentStatus.pending:
        return 'Pending';
    }
  }

  IconData get _methodIcon {
    switch (session.paymentMethod) {
      case PaymentMethod.card:
        return Icons.credit_card;
      case PaymentMethod.applePay:
        return Icons.apple;
      case PaymentMethod.googlePay:
        return Icons.g_mobiledata;
      case PaymentMethod.cash:
        return Icons.money;
      case PaymentMethod.local:
        return Icons.account_balance;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.local_parking,
                      color: AppColors.primary, size: 26),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(session.parkingSpotName,
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 15)),
                      const SizedBox(height: 2),
                      Text(session.parkingSpotAddress,
                          style: TextStyle(
                              fontSize: 12, color: Colors.grey[600]),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          _InfoPill(
                            icon: Icons.access_time,
                            label: DateFormatter.durationMinutes(
                                session.duration.inMinutes),
                          ),
                          const SizedBox(width: 6),
                          _InfoPill(
                            icon: _methodIcon,
                            label: session.paymentMethodLabel,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(session.totalAmount.asCurrency,
                        style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 17,
                            color: AppColors.primary)),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: _statusColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(_statusLabel,
                          style: TextStyle(
                              color: _statusColor,
                              fontSize: 10,
                              fontWeight: FontWeight.w700)),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: const BorderRadius.vertical(
                  bottom: Radius.circular(16)),
            ),
            child: Row(
              children: [
                Icon(Icons.calendar_today_outlined,
                    size: 13, color: Colors.grey[500]),
                const SizedBox(width: 6),
                Text(
                  DateFormatter.dateTime(session.startTime),
                  style:
                      TextStyle(fontSize: 11, color: Colors.grey[600]),
                ),
                const Spacer(),
                if (session.transactionId != null) ...[
                  Text('TXN: ${session.transactionId!.substring(0, 12)}...',
                      style: TextStyle(
                          fontSize: 10,
                          color: Colors.grey[400],
                          fontFamily: 'monospace')),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoPill extends StatelessWidget {
  final IconData icon;
  final String label;
  const _InfoPill({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding:
          const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: Colors.grey[600]),
          const SizedBox(width: 4),
          Text(label,
              style: TextStyle(
                  fontSize: 10,
                  color: Colors.grey[700],
                  fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class _EmptyHistory extends StatelessWidget {
  final AppLocalizations l10n;
  const _EmptyHistory({required this.l10n});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.08),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.receipt_long_outlined,
                size: 48, color: AppColors.primary),
          ),
          const SizedBox(height: 20),
          const Text('No parking history yet',
              style:
                  TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Text('Your completed parking sessions will appear here.',
              style: TextStyle(fontSize: 13, color: Colors.grey[500]),
              textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

extension on double {
  String get asCurrency => '\$${toStringAsFixed(2)}';
}
