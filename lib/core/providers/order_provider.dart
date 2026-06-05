import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';
import 'package:intl/intl.dart';
import '../../models/order.dart';
import '../../models/order_item.dart';
import '../database/hive_service.dart';
import 'cart_provider.dart';

class OrderProvider extends ChangeNotifier {
  List<Order> _orders = [];
  bool _isLoading = false;

  List<Order> get orders => _orders;
  bool get isLoading => _isLoading;

  List<Order> get todaysOrders {
    final today = DateTime.now();
    return _orders.where((o) =>
      o.createdAt.year == today.year &&
      o.createdAt.month == today.month &&
      o.createdAt.day == today.day
    ).toList()..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  double get todaysRevenue =>
      todaysOrders.where((o) => o.status != 'cancelled').fold(0, (s, o) => s + o.totalAmount);

  void loadOrders() {
    _orders = HiveService.orders.values.toList();
    notifyListeners();
  }

  Future<Order> placeOrder(CartProvider cart, String createdBy) async {
    _isLoading = true;
    notifyListeners();

    final id = const Uuid().v4().substring(0, 8).toUpperCase();
    final order = Order(
      id: id,
      orderType: cart.orderType,
      tableNumber: cart.tableNumber,
      customerName: cart.customerName,
      customerPhone: cart.customerPhone,
      deliveryAddress: cart.deliveryAddress,
      items: cart.items.map((i) => OrderItem(
        menuItemId: i.menuItemId,
        menuItemName: i.menuItemName,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        removedIngredients: i.removedIngredients,
        selectedSauces: i.selectedSauces,
        specialInstructions: i.specialInstructions,
        emoji: i.emoji,
      )).toList(),
      totalAmount: cart.total,
      createdAt: DateTime.now(),
      createdByUsername: createdBy,
    );

    await HiveService.orders.put(order.id, order);
    _orders.add(order);

    _isLoading = false;
    notifyListeners();

    return order;
  }

  void updateStatus(String orderId, String status) {
    final order = HiveService.orders.get(orderId);
    if (order != null) {
      order.status = status;
      order.save();
      loadOrders();
    }
  }
}
