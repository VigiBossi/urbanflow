import '../../mock/mock_network.dart';
import '../../mock/skopje_data.dart';
import '../../models/app_user.dart';
import '../auth_repository.dart';

/// In-memory authentication with the two demo accounts.
class MockAuthRepository implements AuthRepository {
  MockAuthRepository({this.network = MockNetwork.instant});

  final MockNetwork network;

  static const List<AppUser> _users = [
    SkopjeData.citizenUser,
    SkopjeData.municipalityUser,
  ];

  @override
  Future<AppUser> login({required String email, required String password}) {
    return network.run(() {
      final normalized = email.trim().toLowerCase();
      final expected = SkopjeData.passwords[normalized];
      if (expected == null || expected != password) {
        throw const AuthException(AuthErrorCode.invalidCredentials);
      }
      return _users.firstWhere((u) => u.email == normalized);
    });
  }

  @override
  Future<void> logout() => network.run(() {});
}
