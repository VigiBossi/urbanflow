import 'package:hive/hive.dart';

part 'menu_item.g.dart';

@HiveType(typeId: 1)
class MenuItem extends HiveObject {
  @HiveField(0)
  String id;

  @HiveField(1)
  String name;

  @HiveField(2)
  String category;

  @HiveField(3)
  double price;

  @HiveField(4)
  String? description;

  @HiveField(5)
  List<String> availableSauces;

  @HiveField(6)
  bool isAvailable;

  @HiveField(7)
  String? emoji;

  MenuItem({
    required this.id,
    required this.name,
    required this.category,
    required this.price,
    this.description,
    this.availableSauces = const [],
    this.isAvailable = true,
    this.emoji,
  });
}
