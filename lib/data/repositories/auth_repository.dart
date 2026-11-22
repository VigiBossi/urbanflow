import '../models/app_user.dart';

enum AuthErrorCode { invalidCredentials, network, unknown }

class AuthException implements Exception {
  const AuthException(this.code);

  final AuthErrorCode code;

  @override
  String toString() => 'AuthException(${code.name})';
}

/// Authentication backend contract.
abstract interface class AuthRepository {
  /// Signs in and returns the user, or throws [AuthException].
  Future<AppUser> login({required String email, required String password});

  Future<void> logout();
}
