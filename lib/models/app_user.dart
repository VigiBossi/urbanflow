import 'package:hive/hive.dart';

part 'app_user.g.dart';

@HiveType(typeId: 0)
class AppUser extends HiveObject {
  @HiveField(0)
  String username;

  @HiveField(1)
  String pin;

  @HiveField(2)
  String role; // 'waiter' or 'manager'

  @HiveField(3)
  String displayName;

  AppUser({
    required this.username,
    required this.pin,
    required this.role,
    required this.displayName,
  });
}
