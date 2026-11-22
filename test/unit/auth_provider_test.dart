import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:urbanflow_ai/core/constants/app_constants.dart';
import 'package:urbanflow_ai/data/models/app_user.dart';
import 'package:urbanflow_ai/data/repositories/auth_repository.dart';
import 'package:urbanflow_ai/data/repositories/mock/mock_auth_repository.dart';
import 'package:urbanflow_ai/data/services/local_store.dart';
import 'package:urbanflow_ai/providers/auth_provider.dart';

class _FailingRepository implements AuthRepository {
  @override
  Future<AppUser> login({required String email, required String password}) =>
      Future.error(Exception('offline'));

  @override
  Future<void> logout() async {}
}

void main() {
  late LocalStore store;

  Future<AuthProvider> create({AuthRepository? repository}) async {
    return AuthProvider(
      repository: repository ?? MockAuthRepository(),
      store: store,
    );
  }

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    store = LocalStore(await SharedPreferences.getInstance());
  });

  test(
    'starts unknown and becomes unauthenticated without a session',
    () async {
      final auth = await create();
      expect(auth.status, AuthStatus.unknown);
      await auth.restoreSession();
      expect(auth.status, AuthStatus.unauthenticated);
      expect(auth.user, isNull);
    },
  );

  test('citizen login succeeds and persists the session', () async {
    final auth = await create();
    await auth.restoreSession();
    final ok = await auth.login('user@example.com', 'password123');
    expect(ok, isTrue);
    expect(auth.isAuthenticated, isTrue);
    expect(auth.user!.role, UserRole.citizen);
    expect(auth.isMunicipality, isFalse);
    expect(store.getJson(StorageKeys.session)?['email'], 'user@example.com');
  });

  test('municipality login has the municipality role', () async {
    final auth = await create();
    final ok = await auth.login(' Municipality@UrbanFlow.ai ', 'password123');
    expect(ok, isTrue);
    expect(auth.isMunicipality, isTrue);
  });

  test('wrong password sets invalidCredentials and stays signed out', () async {
    final auth = await create();
    final ok = await auth.login('user@example.com', 'wrong-pass');
    expect(ok, isFalse);
    expect(auth.status, AuthStatus.unauthenticated);
    expect(auth.error, AuthErrorCode.invalidCredentials);
    expect(store.getJson(StorageKeys.session), isNull);

    auth.clearError();
    expect(auth.error, isNull);
  });

  test('unexpected failures map to a network error', () async {
    final auth = await create(repository: _FailingRepository());
    expect(await auth.login('user@example.com', 'password123'), isFalse);
    expect(auth.error, AuthErrorCode.network);
  });

  test('session is restored on the next launch', () async {
    final first = await create();
    await first.login('municipality@urbanflow.ai', 'password123');

    final second = await create();
    await second.restoreSession();
    expect(second.isAuthenticated, isTrue);
    expect(second.user!.email, 'municipality@urbanflow.ai');
  });

  test('corrupt stored session is discarded', () async {
    await store.setJson(StorageKeys.session, {'unexpected': true});
    final auth = await create();
    await auth.restoreSession();
    expect(auth.status, AuthStatus.unauthenticated);
    expect(store.containsKey(StorageKeys.session), isFalse);
  });

  test('logout clears user and stored session', () async {
    final auth = await create();
    await auth.login('user@example.com', 'password123');
    await auth.logout();
    expect(auth.user, isNull);
    expect(auth.status, AuthStatus.unauthenticated);
    expect(store.getJson(StorageKeys.session), isNull);
  });

  test('notifies listeners through the login lifecycle', () async {
    final auth = await create();
    final statuses = <AuthStatus>[];
    auth.addListener(() => statuses.add(auth.status));
    await auth.login('user@example.com', 'password123');
    expect(statuses, [AuthStatus.authenticating, AuthStatus.authenticated]);
  });
}
