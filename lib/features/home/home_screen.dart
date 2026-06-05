import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_colors.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/providers/order_provider.dart';
import '../../core/providers/cart_provider.dart';
import '../orders/order_type_screen.dart';
import '../menu/menu_screen.dart';
import '../manager/manager_dashboard_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrderProvider>().loadOrders();
    });
  }

  void _startNewOrder() {
    context.read<CartProvider>().clear();
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => OrderTypeScreen(
          onConfirmed: () {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => const MenuScreen()),
            );
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final orders = context.watch<OrderProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('UrbanFlow POS', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: AppColors.surface,
        actions: [
          if (auth.isManager)
            IconButton(
              icon: const Icon(Icons.dashboard_outlined),
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ManagerDashboardScreen()),
              ),
            ),
          IconButton(
            icon: const Icon(Icons.logout_outlined),
            onPressed: () => _confirmLogout(context, auth),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildGreeting(auth),
            const SizedBox(height: 24),
            _buildStatsRow(orders),
            const SizedBox(height: 32),
            _buildNewOrderButton(),
            const SizedBox(height: 32),
            _buildRecentOrders(orders),
          ],
        ),
      ),
    );
  }

  Widget _buildGreeting(AuthProvider auth) {
    final hour = DateTime.now().hour;
    final greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('$greeting,', style: const TextStyle(fontSize: 16, color: AppColors.textSecondary)),
        Text(auth.currentUser?.displayName ?? 'User',
            style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
        Container(
          margin: const EdgeInsets.only(top: 4),
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
          decoration: BoxDecoration(
            color: auth.isManager ? AppColors.accent.withOpacity(0.15) : AppColors.surfaceVariant,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            auth.isManager ? 'Manager' : 'Waiter',
            style: TextStyle(fontSize: 12, color: auth.isManager ? AppColors.accent : AppColors.textSecondary, fontWeight: FontWeight.w600),
          ),
        ),
      ],
    );
  }

  Widget _buildStatsRow(OrderProvider orders) {
    return Row(
      children: [
        _statCard('Today\'s Orders', '${orders.todaysOrders.length}', Icons.receipt_long_outlined),
        const SizedBox(width: 16),
        _statCard('Revenue', '${orders.todaysRevenue.toInt()} DEN', Icons.attach_money_rounded),
      ],
    );
  }

  Widget _statCard(String label, String value, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: AppColors.accent.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, color: AppColors.accent, size: 22),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNewOrderButton() {
    return GestureDetector(
      onTap: _startNewOrder,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [AppColors.accent, AppColors.accentDark],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Row(
          children: [
            Icon(Icons.add_circle_outline, color: Colors.white, size: 32),
            SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('New Order', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
                Text('Tap to start taking orders', style: TextStyle(color: Colors.white70, fontSize: 13)),
              ],
            ),
            Spacer(),
            Icon(Icons.arrow_forward_ios, color: Colors.white70, size: 18),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentOrders(OrderProvider orders) {
    final recent = orders.todaysOrders.take(5).toList();
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Recent Orders', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
          const SizedBox(height: 12),
          Expanded(
            child: recent.isEmpty
                ? const Center(child: Text('No orders yet today', style: TextStyle(color: AppColors.textSecondary)))
                : ListView.separated(
                    itemCount: recent.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (_, i) {
                      final o = recent[i];
                      final isDineIn = o.orderType == 'dine_in';
                      return Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.cardBorder),
                        ),
                        child: Row(
                          children: [
                            Icon(isDineIn ? Icons.table_restaurant : Icons.delivery_dining, color: AppColors.textSecondary, size: 20),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('#${o.id}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                                  Text(isDineIn ? 'Table ${o.tableNumber}' : o.customerName ?? 'Delivery',
                                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                                ],
                              ),
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text('${o.totalAmount.toInt()} DEN', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.accent)),
                                Text(DateFormat('HH:mm').format(o.createdAt), style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmLogout(BuildContext context, AuthProvider auth) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text('Logout', style: TextStyle(color: AppColors.textPrimary)),
        content: const Text('Are you sure you want to logout?', style: TextStyle(color: AppColors.textSecondary)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          ElevatedButton(onPressed: () => Navigator.pop(context, true), child: const Text('Logout')),
        ],
      ),
    );
    if (confirmed == true) auth.logout();
  }
}
