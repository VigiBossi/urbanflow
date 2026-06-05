import 'package:hive_flutter/hive_flutter.dart';
import '../../models/app_user.dart';
import '../../models/menu_item.dart';
import '../../models/order_item.dart';
import '../../models/order.dart';

class HiveService {
  static const String usersBox = 'users';
  static const String menuBox = 'menu';
  static const String ordersBox = 'orders';
  static const String settingsBox = 'settings';

  static Future<void> init() async {
    await Hive.initFlutter();
    Hive.registerAdapter(AppUserAdapter());
    Hive.registerAdapter(MenuItemAdapter());
    Hive.registerAdapter(OrderItemAdapter());
    Hive.registerAdapter(OrderAdapter());

    await Hive.openBox<AppUser>(usersBox);
    await Hive.openBox<MenuItem>(menuBox);
    await Hive.openBox<Order>(ordersBox);
    await Hive.openBox(settingsBox);

    await _seedIfEmpty();
  }

  static Future<void> _seedIfEmpty() async {
    final settings = Hive.box(settingsBox);
    if (settings.get('seeded') == true) return;

    await _seedUsers();
    await _seedMenu();

    settings.put('seeded', true);
  }

  static Future<void> _seedUsers() async {
    final box = Hive.box<AppUser>(usersBox);
    box.put('waiter1', AppUser(username: 'waiter1', pin: '1234', role: 'waiter', displayName: 'Waiter 1'));
    box.put('manager1', AppUser(username: 'manager1', pin: '9999', role: 'manager', displayName: 'Manager'));
  }

  static Future<void> seedMenuData() async {
    final box = Hive.box<MenuItem>(menuBox);
    await box.clear();

    final allSauces = ['Barbecue', 'Samarai', 'Algerian', 'Churi de Madros', 'Majo', 'Ketchup'];

    final items = [
      // TACO
      MenuItem(id: 'taco_cc', name: 'Chicken Chilli Taco', category: 'Taco', price: 220, emoji: '🌮', availableSauces: allSauces),
      MenuItem(id: 'taco_cb', name: 'Chicken Basic Taco', category: 'Taco', price: 220, emoji: '🌮', availableSauces: allSauces),
      MenuItem(id: 'taco_gb', name: 'Ground Beef Taco', category: 'Taco', price: 220, emoji: '🌮', availableSauces: allSauces),
      MenuItem(id: 'taco_mix', name: 'Mix Taco', category: 'Taco', price: 250, emoji: '🌮', availableSauces: allSauces),

      // BAGUETE
      MenuItem(id: 'bag_cc', name: 'Chicken Chilli Baguete', category: 'Baguete', price: 170, emoji: '🥖', availableSauces: allSauces),
      MenuItem(id: 'bag_classic', name: 'Classic Baguete', category: 'Baguete', price: 170, emoji: '🥖', availableSauces: allSauces),
      MenuItem(id: 'bag_beef', name: 'Beef Baguete', category: 'Baguete', price: 170, emoji: '🥖', availableSauces: allSauces),
      MenuItem(id: 'bag_mix', name: 'Mix Baguete', category: 'Baguete', price: 200, emoji: '🥖', availableSauces: allSauces),

      // BURGERS
      MenuItem(id: 'burg_ham', name: 'Hamburger', category: 'Burgers', price: 150, emoji: '🍔', availableSauces: allSauces),
      MenuItem(id: 'burg_big', name: 'Big Burger', category: 'Burgers', price: 180, emoji: '🍔', availableSauces: allSauces),
      MenuItem(id: 'burg_cheese', name: 'Cheese Burger', category: 'Burgers', price: 160, emoji: '🍔', availableSauces: allSauces),
      MenuItem(id: 'burg_chick', name: 'Chicken Burger', category: 'Burgers', price: 150, emoji: '🍗', availableSauces: allSauces),
      MenuItem(id: 'burg_dchick', name: 'Double Chicken', category: 'Burgers', price: 200, emoji: '🍗', availableSauces: allSauces),

      // TOAST
      MenuItem(id: 'toast_fries', name: 'Toast with Fries', category: 'Toast', price: 100, emoji: '🍞', availableSauces: allSauces),
      MenuItem(id: 'toast_plain', name: 'Toast', category: 'Toast', price: 80, emoji: '🍞', availableSauces: allSauces),

      // OTHERS
      MenuItem(id: 'nuggets', name: 'Chicken Nuggets (10 pcs)', category: 'Others', price: 120, emoji: '🍗', availableSauces: allSauces),
      MenuItem(id: 'fingers', name: 'Chicken Fingers', category: 'Others', price: 170, emoji: '🍗', availableSauces: allSauces),
      MenuItem(id: 'fries', name: 'Fries', category: 'Others', price: 80, emoji: '🍟', availableSauces: allSauces),
    ];

    for (final item in items) {
      box.put(item.id, item);
    }
  }

  static Future<void> _seedMenu() async {
    await seedMenuData();
  }

  static Box<AppUser> get users => Hive.box<AppUser>(usersBox);
  static Box<MenuItem> get menu => Hive.box<MenuItem>(menuBox);
  static Box<Order> get orders => Hive.box<Order>(ordersBox);
  static Box get settings => Hive.box(settingsBox);
}
