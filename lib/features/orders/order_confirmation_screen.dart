import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../../core/constants/app_colors.dart';
import '../../models/order.dart';

class OrderConfirmationScreen extends StatelessWidget {
  final Order order;

  const OrderConfirmationScreen({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 24),
              Container(
                width: 80, height: 80,
                decoration: const BoxDecoration(color: AppColors.success, shape: BoxShape.circle),
                child: const Icon(Icons.check, color: Colors.white, size: 48),
              ),
              const SizedBox(height: 20),
              const Text('Order Placed!', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
              const SizedBox(height: 8),
              Text('Order #${order.id}', style: const TextStyle(fontSize: 16, color: AppColors.textSecondary)),
              const SizedBox(height: 32),
              _buildOrderCard(),
              const Spacer(),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _printReceipt(context),
                      icon: const Icon(Icons.print_outlined, color: AppColors.accent),
                      label: const Text('Print', style: TextStyle(color: AppColors.accent)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.accent),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => Navigator.popUntil(context, (r) => r.isFirst),
                      icon: const Icon(Icons.home_outlined),
                      label: const Text('New Order'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOrderCard() {
    final isDineIn = order.orderType == 'dine_in';
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(isDineIn ? Icons.table_restaurant : Icons.delivery_dining, color: AppColors.accent),
              const SizedBox(width: 8),
              Text(isDineIn ? 'Table ${order.tableNumber}' : 'Delivery to ${order.customerName}',
                  style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary, fontSize: 16)),
            ],
          ),
          const Divider(color: AppColors.divider, height: 24),
          ...order.items.map((item) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                Text('${item.quantity}x', style: const TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                const SizedBox(width: 8),
                Expanded(child: Text(item.menuItemName, style: const TextStyle(color: AppColors.textPrimary))),
                Text('${item.totalPrice.toInt()} DEN', style: const TextStyle(color: AppColors.textPrimary)),
              ],
            ),
          )),
          const Divider(color: AppColors.divider, height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('TOTAL', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary, fontSize: 16)),
              Text('${order.totalAmount.toInt()} DEN', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.accent, fontSize: 18)),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            DateFormat('dd MMM yyyy • HH:mm').format(order.createdAt),
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
          ),
        ],
      ),
    );
  }

  Future<void> _printReceipt(BuildContext context) async {
    final doc = pw.Document();
    final isDineIn = order.orderType == 'dine_in';

    doc.addPage(pw.Page(
      pageFormat: PdfPageFormat.roll80,
      build: (ctx) => pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.center,
        children: [
          pw.Text('UrbanFlow POS', style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
          pw.SizedBox(height: 4),
          pw.Text('Order #${order.id}', style: pw.TextStyle(fontSize: 12)),
          pw.Text(DateFormat('dd/MM/yyyy HH:mm').format(order.createdAt), style: pw.TextStyle(fontSize: 10)),
          pw.Divider(),
          pw.Text(isDineIn ? 'DINE IN - Table ${order.tableNumber}' : 'DELIVERY - ${order.customerName}',
              style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
          if (!isDineIn && order.customerPhone != null)
            pw.Text('Tel: ${order.customerPhone}', style: pw.TextStyle(fontSize: 10)),
          pw.Divider(),
          ...order.items.map((item) => pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            children: [
              pw.Expanded(child: pw.Text('${item.quantity}x ${item.menuItemName}', style: pw.TextStyle(fontSize: 11))),
              pw.Text('${item.totalPrice.toInt()} DEN', style: pw.TextStyle(fontSize: 11)),
            ],
          )),
          if (order.items.any((i) => i.selectedSauces.isNotEmpty || i.removedIngredients.isNotEmpty || i.specialInstructions != null))
            ...order.items.where((i) => i.selectedSauces.isNotEmpty || i.removedIngredients.isNotEmpty || i.specialInstructions != null)
                .map((item) => pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text('  ${item.menuItemName}:', style: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold)),
                    if (item.selectedSauces.isNotEmpty)
                      pw.Text('  + ${item.selectedSauces.join(', ')}', style: pw.TextStyle(fontSize: 9)),
                    if (item.removedIngredients.isNotEmpty)
                      pw.Text('  - no ${item.removedIngredients.join(', ')}', style: pw.TextStyle(fontSize: 9)),
                    if (item.specialInstructions != null)
                      pw.Text('  * ${item.specialInstructions}', style: pw.TextStyle(fontSize: 9)),
                  ],
                )),
          pw.Divider(),
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            children: [
              pw.Text('TOTAL', style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold)),
              pw.Text('${order.totalAmount.toInt()} DEN', style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold)),
            ],
          ),
          pw.SizedBox(height: 8),
          pw.Text('Thank you!', style: pw.TextStyle(fontSize: 12)),
        ],
      ),
    ));

    await Printing.layoutPdf(onLayout: (_) => doc.save());
  }
}
