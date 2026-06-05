import 'package:flutter/foundation.dart';
import '../../models/menu_item.dart';
import '../database/hive_service.dart';

class MenuProvider extends ChangeNotifier {
  List<MenuItem> _items = [];
  String _selectedCategory = 'All';
  String _searchQuery = '';

  List<MenuItem> get allItems => _items;
  String get selectedCategory => _selectedCategory;
  String get searchQuery => _searchQuery;

  List<String> get categories {
    final cats = _items.map((e) => e.category).toSet().toList();
    cats.sort();
    return ['All', ...cats];
  }

  List<MenuItem> get filteredItems {
    var items = _items.where((i) => i.isAvailable).toList();
    if (_selectedCategory != 'All') {
      items = items.where((i) => i.category == _selectedCategory).toList();
    }
    if (_searchQuery.isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      items = items.where((i) => i.name.toLowerCase().contains(q)).toList();
    }
    return items;
  }

  void loadItems() {
    _items = HiveService.menu.values.toList();
    notifyListeners();
  }

  void selectCategory(String category) {
    _selectedCategory = category;
    notifyListeners();
  }

  void setSearch(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  Future<void> reseedMenu() async {
    await HiveService.seedMenuData();
    loadItems();
  }

  void toggleAvailability(String itemId) {
    final item = HiveService.menu.get(itemId);
    if (item != null) {
      item.isAvailable = !item.isAvailable;
      item.save();
      loadItems();
    }
  }
}
