import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../../models/app_user.dart';
import '../database/hive_service.dart';

class AuthProvider extends ChangeNotifier {
  AppUser? _currentUser;
  bool _isLoading = false;
  String? _error;

  AppUser? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  bool get isLoggedIn => _currentUser != null;
  bool get isManager => _currentUser?.role == 'manager';
  String? get error => _error;

  Future<bool> login(String username, String pin) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 300));

    final user = HiveService.users.get(username.toLowerCase());
    if (user != null && user.pin == pin) {
      _currentUser = user;
      _isLoading = false;
      notifyListeners();
      return true;
    }

    _error = 'Invalid username or PIN';
    _isLoading = false;
    notifyListeners();
    return false;
  }

  void logout() {
    _currentUser = null;
    _error = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
