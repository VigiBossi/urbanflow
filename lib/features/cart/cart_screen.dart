import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/providers/cart_provider.dart';
import '../../core/providers/order_provider.dart';
import '../../core/providers/auth_provider.dart';
import '../../models/order.dart';
import '../../models/order_item.dart';
import '../orders/order_confirmation_screen.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<CartProvider>(
      builder: (_, cart, __) => Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: const Text('Cart'),
          backgroundColor: AppColors.surface,
          actions: [
            if (cart.items.isNotEmpty)
              TextButton(
                onPressed: () {
                  cart.clear();
                  Navigator.popUntil(context, (r) => r.isFirst);
                },
                child: const Text('Clear All', style: TextStyle(color: AppColors.error)),
              ),
          ],
        ),
        body: cart.items.isEmpty
            ? _buildEmpty(context)
            : Column(
                children: [
                  _buildOrderInfo(cart),
                  Expanded(child: _buildItemList(context, cart)),
                  _buildTotal(context, cart),
                ],
              ),
      ),
    );
  }

  Widget _buildEmpty(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.shopping_cart_outlined, size: 80, color: AppColors.textSecondary),
          const SizedBox(height: 16),
          const Text('Your cart is empty', style: TextStyle(fontSize: 20, color: AppColors.textSecondary)),
          const SizedBox(height: 24),
          ElevatedButton(onPressed: () => Navigator.pop(context), child: const Text('Back to Menu')),
        ],
      ),
    );
  }

  Widget _buildOrderInfo(CartProvider cart) {
    final isDineIn = cart.orderType == 'dine_in';
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.accent.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.accent.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(isDineIn ? Icons.table_restaurant : Icons.delivery_dining, color: AppColors.accent),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(isDineIn ? 'Dine In' : 'Delivery',
                  style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.accent)),
              Text(
                isDineIn ? 'Table ${cart.tableNumber}' : '${cart.customerName} • ${cart.customerPhone}',
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildItemList(BuildContext context, CartProvider cart) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: cart.items.length,
      itemBuilder: (_, i) => _buildCartItem(context, cart, i),
    );
  }

  Widget _buildCartItem(BuildContext context, CartProvider cart, int index) {
    final item = cart.items[index];
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(item.emoji ?? '🍽️', style: const TextStyle(fontSize: 28)),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.menuItemName, style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                    if (item.selectedSauces.isNotEmpty)
                      Text('Sauces: ${item.selectedSauces.join(', ')}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    if (item.removedIngredients.isNotEmpty)
                      Text('No: ${item.removedIngredients.join(', ')}', style: const TextStyle(fontSize: 12, color: AppColors.error)),
                    if (item.specialInstructions != null)
                      Text('Note: ${item.specialInstructions}', style: const TextStyle(fontSize: 12, color: AppColors.warning)),
                  ],
                ),
              ),
              Text('${item.totalPrice.toInt()} DEN', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.accent)),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _qtyBtn(Icons.remove, () => cart.updateQuantity(index, item.quantity - 1)),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text('${item.quantity}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
              ),
              _qtyBtn(Icons.add, () => cart.updateQuantity(index, item.quantity + 1)),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.delete_outline, color: AppColors.error),
                onPressed: () => cart.removeItem(index),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _qtyBtn(IconData icon, VoidCallback onTap) {
    return Material(
      color: AppColors.surfaceVariant,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Padding(padding: const EdgeInsets.all(8), child: Icon(icon, size: 16, color: AppColors.textPrimary)),
      ),
    );
  }

  Widget _buildTotal(BuildContext context, CartProvider cart) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.divider)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Total', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
              Text('${cart.total.toInt()} DEN', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.accent)),
            ],
          ),
          const SizedBox(height: 16),
          Consumer<OrderProvider>(
            builder: (_, orderProv, __) => SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: orderProv.isLoading ? null : () => _placeOrder(context),
                icon: orderProv.isLoading
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.receipt_long),
                label: const Text('Place Order & Print Receipt'),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _placeOrder(BuildContext context) async {
    final cart = context.read<CartProvider>();
    final orderProv = context.read<OrderProvider>();
    final auth = context.read<AuthProvider>();

    final order = await orderProv.placeOrder(cart, auth.currentUser?.username ?? 'unknown');
    cart.clear();

    if (context.mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => OrderConfirmationScreen(order: order)),
      );
    }
  }
}
