// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_item.dart';

class OrderItemAdapter extends TypeAdapter<OrderItem> {
  @override
  final int typeId = 2;

  @override
  OrderItem read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return OrderItem(
      menuItemId: fields[0] as String,
      menuItemName: fields[1] as String,
      unitPrice: fields[2] as double,
      quantity: fields[3] as int,
      removedIngredients: (fields[4] as List).cast<String>(),
      selectedSauces: (fields[5] as List).cast<String>(),
      specialInstructions: fields[6] as String?,
      emoji: fields[7] as String?,
    );
  }

  @override
  void write(BinaryWriter writer, OrderItem obj) {
    writer
      ..writeByte(8)
      ..writeByte(0)
      ..write(obj.menuItemId)
      ..writeByte(1)
      ..write(obj.menuItemName)
      ..writeByte(2)
      ..write(obj.unitPrice)
      ..writeByte(3)
      ..write(obj.quantity)
      ..writeByte(4)
      ..write(obj.removedIngredients)
      ..writeByte(5)
      ..write(obj.selectedSauces)
      ..writeByte(6)
      ..write(obj.specialInstructions)
      ..writeByte(7)
      ..write(obj.emoji);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is OrderItemAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
