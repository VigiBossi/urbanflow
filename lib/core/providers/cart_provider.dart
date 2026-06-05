import 'package:flutter/foundation.dart';
import '../../models/order_item.dart';
import '../../models/menu_item.dart';

class CartProvider extends ChangeNotifier {
  final List<OrderItem> _items = [];
  String _orderType = 'dine_in';
  int? _tableNumber;
  String? _customerName;
  String? _customerPhone;
  String? _deliveryAddress;

  List<OrderItem> get items => List.unmodifiable(_items);
  String get orderType => _orderType;
  int? get tableNumber => _tableNumber;
  String? get customerName => _customerName;
  String? get customerPhone => _customerPhone;
  String? get deliveryAddress => _deliveryAddress;
  int get itemCount => _items.fold(0, (sum, i) => sum + i.quantity);

  double get total => _items.fold(0, (sum, i) => sum + i.totalPrice);

  void setOrderType(String type) {
    _orderType = type;
    notifyListeners();
  }

  void setDineIn(int tableNumber) {
    _orderType = 'dine_in';
    _tableNumber = tableNumber;
    notifyListeners();
  }

  void setDelivery({required String name, required String phone, String? address}) {
    _orderType = 'delivery';
    _customerName = name;
    _customerPhone = phone;
    _deliveryAddress = address;
    notifyListeners();
  }

  void addItem(MenuItem menuItem, {
    int quantity = 1,
    List<String> removedIngredients = const [],
    List<String> selectedSauces = const [],
    String? specialInstructions,
  }) {
    final existing = _items.indexWhere(
      (i) => i.menuItemId == menuItem.id &&
             _listEqual(i.removedIngredients, removedIngredients) &&
             _listEqual(i.selectedSauces, selectedSauces) &&
             i.specialInstructions == specialInstructions,
    );

    if (existing >= 0) {
      _items[existing] = _items[existing].copyWith(
        quantity: _items[existing].quantity + quantity,
      );
    } else {
      _items.add(OrderItem(
        menuItemId: menuItem.id,
        menuItemName: menuItem.name,
        unitPrice: menuItem.price,
        quantity: quantity,
        removedIngredients: List.from(removedIngredients),
        selectedSauces: List.from(selectedSauces),
        specialInstructions: specialInstructions,
        emoji: menuItem.emoji,
      ));
    }
    notifyListeners();
  }

  void removeItem(int index) {
    _items.removeAt(index);
    notifyListeners();
  }

  void updateQuantity(int index, int quantity) {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }
    _items[index] = _items[index].copyWith(quantity: quantity);
    notifyListeners();
  }

  void clear() {
    _items.clear();
    _tableNumber = null;
    _customerName = null;
    _customerPhone = null;
    _deliveryAddress = null;
    _orderType = 'dine_in';
    notifyListeners();
  }

  bool _listEqual(List<String> a, List<String> b) {
    if (a.length != b.length) return false;
    final sa = List.from(a)..sort();
    final sb = List.from(b)..sort();
    for (int i = 0; i < sa.length; i++) {
      if (sa[i] != sb[i]) return false;
    }
    return true;
  }
}
