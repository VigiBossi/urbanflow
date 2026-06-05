import 'package:hive/hive.dart';

part 'order_item.g.dart';

@HiveType(typeId: 2)
class OrderItem extends HiveObject {
  @HiveField(0)
  String menuItemId;

  @HiveField(1)
  String menuItemName;

  @HiveField(2)
  double unitPrice;

  @HiveField(3)
  int quantity;

  @HiveField(4)
  List<String> removedIngredients;

  @HiveField(5)
  List<String> selectedSauces;

  @HiveField(6)
  String? specialInstructions;

  @HiveField(7)
  String? emoji;

  OrderItem({
    required this.menuItemId,
    required this.menuItemName,
    required this.unitPrice,
    required this.quantity,
    this.removedIngredients = const [],
    this.selectedSauces = const [],
    this.specialInstructions,
    this.emoji,
  });

  double get totalPrice => unitPrice * quantity;

  OrderItem copyWith({
    int? quantity,
    List<String>? removedIngredients,
    List<String>? selectedSauces,
    String? specialInstructions,
  }) {
    return OrderItem(
      menuItemId: menuItemId,
      menuItemName: menuItemName,
      unitPrice: unitPrice,
      quantity: quantity ?? this.quantity,
      removedIngredients: removedIngredients ?? this.removedIngredients,
      selectedSauces: selectedSauces ?? this.selectedSauces,
      specialInstructions: specialInstructions ?? this.specialInstructions,
      emoji: emoji,
    );
  }
}
