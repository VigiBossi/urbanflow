import 'package:hive/hive.dart';
import 'order_item.dart';

part 'order.g.dart';

@HiveType(typeId: 3)
class Order extends HiveObject {
  @HiveField(0)
  String id;

  @HiveField(1)
  String orderType; // 'dine_in' or 'delivery'

  @HiveField(2)
  int? tableNumber;

  @HiveField(3)
  String? customerName;

  @HiveField(4)
  String? customerPhone;

  @HiveField(5)
  String? deliveryAddress;

  @HiveField(6)
  List<OrderItem> items;

  @HiveField(7)
  double totalAmount;

  @HiveField(8)
  DateTime createdAt;

  @HiveField(9)
  String status; // 'pending', 'preparing', 'ready', 'completed'

  @HiveField(10)
  String createdByUsername;

  Order({
    required this.id,
    required this.orderType,
    this.tableNumber,
    this.customerName,
    this.customerPhone,
    this.deliveryAddress,
    required this.items,
    required this.totalAmount,
    required this.createdAt,
    this.status = 'pending',
    required this.createdByUsername,
  });
}
