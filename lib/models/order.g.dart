// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order.dart';

class OrderAdapter extends TypeAdapter<Order> {
  @override
  final int typeId = 3;

  @override
  Order read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Order(
      id: fields[0] as String,
      orderType: fields[1] as String,
      tableNumber: fields[2] as int?,
      customerName: fields[3] as String?,
      customerPhone: fields[4] as String?,
      deliveryAddress: fields[5] as String?,
      items: (fields[6] as List).cast<OrderItem>(),
      totalAmount: fields[7] as double,
      createdAt: fields[8] as DateTime,
      status: fields[9] as String,
      createdByUsername: fields[10] as String,
    );
  }

  @override
  void write(BinaryWriter writer, Order obj) {
    writer
      ..writeByte(11)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.orderType)
      ..writeByte(2)
      ..write(obj.tableNumber)
      ..writeByte(3)
      ..write(obj.customerName)
      ..writeByte(4)
      ..write(obj.customerPhone)
      ..writeByte(5)
      ..write(obj.deliveryAddress)
      ..writeByte(6)
      ..write(obj.items)
      ..writeByte(7)
      ..write(obj.totalAmount)
      ..writeByte(8)
      ..write(obj.createdAt)
      ..writeByte(9)
      ..write(obj.status)
      ..writeByte(10)
      ..write(obj.createdByUsername);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is OrderAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
