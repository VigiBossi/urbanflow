import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_colors.dart';
import '../../core/providers/order_provider.dart';
import '../../core/providers/menu_provider.dart';
import '../../core/database/hive_service.dart';
import '../../models/order.dart';

class ManagerDashboardScreen extends StatefulWidget {
  const ManagerDashboardScreen({super.key});

  @override
  State<ManagerDashboardScreen> createState() => _ManagerDashboardScreenState();
}

class _ManagerDashboardScreenState extends State<ManagerDashboardScreen> with SingleTickerProviderStateMixin {
  late TabController _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrderProvider>().loadOrders();
      context.read<MenuProvider>().loadItems();
    });
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Manager Dashboard'),
        backgroundColor: AppColors.surface,
        bottom: TabBar(
          controller: _tabs,
          indicatorColor: AppColors.accent,
          labelColor: AppColors.accent,
          unselectedLabelColor: AppColors.textSecondary,
          tabs: const [
            Tab(text: 'Orders'),
            Tab(text: 'Reports'),
            Tab(text: 'Menu'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabs,
        children: [
          _OrdersTab(),
          _ReportsTab(),
          _MenuTab(),
        ],
      ),
    );
  }
}

class _OrdersTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final orders = context.watch<OrderProvider>();
    final allOrders = orders.orders.reversed.take(50).toList();

    if (allOrders.isEmpty) {
      return const Center(child: Text('No orders yet', style: TextStyle(color: AppColors.textSecondary)));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: allOrders.length,
      itemBuilder: (_, i) {
        final o = allOrders[i];
        return _OrderTile(order: o);
      },
    );
  }
}

class _OrderTile extends StatelessWidget {
  final Order order;
  const _OrderTile({required this.order});

  @override
  Widget build(BuildContext context) {
    final isDineIn = order.orderType == 'dine_in';
    final statusColors = {
      'pending': AppColors.warning,
      'preparing': AppColors.accent,
      'ready': AppColors.success,
      'completed': AppColors.textSecondary,
    };

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
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
              Text('#${order.id}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: (statusColors[order.status] ?? AppColors.textSecondary).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(order.status.toUpperCase(), style: TextStyle(fontSize: 10, color: statusColors[order.status] ?? AppColors.textSecondary, fontWeight: FontWeight.bold)),
              ),
              const Spacer(),
              Text('${order.totalAmount.toInt()} DEN', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.accent)),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            isDineIn ? 'Table ${order.tableNumber}' : 'Delivery: ${order.customerName}',
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
          ),
          Text(DateFormat('dd MMM • HH:mm').format(order.createdAt), style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              for (final s in ['pending', 'preparing', 'ready', 'completed'])
                Padding(
                  padding: const EdgeInsets.only(left: 6),
                  child: TextButton(
                    onPressed: order.status == s ? null : () => context.read<OrderProvider>().updateStatus(order.id, s),
                    style: TextButton.styleFrom(
                      backgroundColor: order.status == s ? AppColors.accent.withOpacity(0.15) : null,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: Text(s, style: TextStyle(fontSize: 11, color: order.status == s ? AppColors.accent : AppColors.textSecondary)),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ReportsTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final orders = context.watch<OrderProvider>();
    final today = orders.todaysOrders;
    final revenue = orders.todaysRevenue;

    final categoryCounts = <String, int>{};
    final categoryRevenue = <String, double>{};
    for (final order in today) {
      for (final item in order.items) {
        categoryCounts[item.menuItemName] = (categoryCounts[item.menuItemName] ?? 0) + item.quantity;
        categoryRevenue[item.menuItemName] = (categoryRevenue[item.menuItemName] ?? 0) + item.totalPrice;
      }
    }

    final topItems = categoryCounts.entries.toList()..sort((a, b) => b.value.compareTo(a.value));

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Today — ${DateFormat('dd MMM yyyy').format(DateTime.now())}',
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 14)),
          const SizedBox(height: 16),
          Row(
            children: [
              _reportCard('Total Orders', '${today.length}', Icons.receipt_outlined),
              const SizedBox(width: 12),
              _reportCard('Revenue', '${revenue.toInt()} DEN', Icons.attach_money),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _reportCard('Dine In', '${today.where((o) => o.orderType == 'dine_in').length}', Icons.table_restaurant),
              const SizedBox(width: 12),
              _reportCard('Delivery', '${today.where((o) => o.orderType == 'delivery').length}', Icons.delivery_dining),
            ],
          ),
          const SizedBox(height: 24),
          const Text('Top Items', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
          const SizedBox(height: 12),
          if (topItems.isEmpty)
            const Text('No data', style: TextStyle(color: AppColors.textSecondary))
          else
            ...topItems.take(10).map((e) => Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Row(
                children: [
                  Expanded(child: Text(e.key, style: const TextStyle(color: AppColors.textPrimary))),
                  Text('x${e.value}', style: const TextStyle(color: AppColors.textSecondary)),
                  const SizedBox(width: 16),
                  Text('${(categoryRevenue[e.key] ?? 0).toInt()} DEN', style: const TextStyle(color: AppColors.accent, fontWeight: FontWeight.bold)),
                ],
              ),
            )),
        ],
      ),
    );
  }

  Widget _reportCard(String label, String value, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: AppColors.accent, size: 22),
            const SizedBox(height: 8),
            Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
            Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }
}

class _MenuTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final menu = context.watch<MenuProvider>();
    final items = menu.allItems;

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Text('${items.length} items', style: const TextStyle(color: AppColors.textSecondary)),
              const Spacer(),
              ElevatedButton.icon(
                onPressed: () async {
                  await menu.reseedMenu();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Menu reseeded!'), backgroundColor: AppColors.success),
                  );
                },
                icon: const Icon(Icons.refresh, size: 16),
                label: const Text('Reseed Menu'),
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: items.length,
            itemBuilder: (_, i) {
              final item = items[i];
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Row(
                  children: [
                    Text(item.emoji ?? '🍽️', style: const TextStyle(fontSize: 24)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.name, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w600)),
                          Text(item.category, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                        ],
                      ),
                    ),
                    Text('${item.price.toInt()} DEN', style: const TextStyle(color: AppColors.accent, fontWeight: FontWeight.bold)),
                    const SizedBox(width: 8),
                    Switch(
                      value: item.isAvailable,
                      activeColor: AppColors.accent,
                      onChanged: (_) => menu.toggleAvailability(item.id),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
