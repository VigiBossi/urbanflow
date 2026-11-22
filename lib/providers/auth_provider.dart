import 'package:flutter/foundation.dart';

import '../core/constants/app_constants.dart';
import '../data/models/app_user.dart';
import '../data/repositories/auth_repository.dart';
import '../data/services/local_store.dart';

enum AuthStatus { unknown, unauthenticated, authenticating, authenticated }

/// Authentication state with a persisted session.
class AuthProvider extends ChangeNotifier {
  AuthProvider({required this.repository, required this.store});

  final AuthRepository repository;
  final LocalStore store;

  AuthStatus _status = AuthStatus.unknown;
  AppUser? _user;
  AuthErrorCode? _error;

  AuthStatus get status => _status;
  AppUser? get user => _user;
  AuthErrorCode? get error => _error;
  bool get isAuthenticated => _status == AuthStatus.authenticated;
  bool get isLoading => _status == AuthStatus.authenticating;
  bool get isMunicipality => _user?.isMunicipality ?? false;

  /// Restores a saved session on app start.
  Future<void> restoreSession() async {
    final json = store.getJson(StorageKeys.session);
    if (json != null) {
      try {
        _user = AppUser.fromJson(json);
        _status = AuthStatus.authenticated;
      } on Object {
        await store.remove(StorageKeys.session);
        _status = AuthStatus.unauthenticated;
      }
    } else {
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  /// Returns true on success; on failure [error] is set.
  Future<bool> login(String email, String password) async {
    if (isLoading) return false;
    _status = AuthStatus.authenticating;
    _error = null;
    notifyListeners();
    try {
      final user = await repository.login(email: email, password: password);
      _user = user;
      _status = AuthStatus.authenticated;
      await store.setJson(StorageKeys.session, user.toJson());
      notifyListeners();
      return true;
    } on AuthException catch (e) {
      _error = e.code;
    } on Exception {
      _error = AuthErrorCode.network;
    }
    _status = AuthStatus.unauthenticated;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    try {
      await repository.logout();
    } on Exception {
      // Logging out locally must always succeed.
    }
    await store.remove(StorageKeys.session);
    _user = null;
    _error = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }

  void clearError() {
    if (_error == null) return;
    _error = null;
    notifyListeners();
  }
}
