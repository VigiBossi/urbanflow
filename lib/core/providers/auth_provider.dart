import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../services/notification_service.dart';
import 'package:uuid/uuid.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _user;
  bool _isLoading = false;
  String? _error;

  static const _kUserKey = 'urbanflow_user';
  final _uuid = const Uuid();

  // Sample municipality accounts for demo
  static const _municipalityEmails = {
    'admin@skopje.mk',
    'municipality@urbanflow.ai',
  };

  UserModel? get user => _user;
  bool get isLoggedIn => _user != null;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isMunicipality => _user?.isMunicipality ?? false;

  // Kept for backward compatibility with app.dart
  String? get userEmail => _user?.email;

  AuthProvider() {
    _tryRestoreSession();
  }

  Future<void> _tryRestoreSession() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString(_kUserKey);
    if (stored != null) {
      // Simple token-based session restore — in production use secure storage
      _user = UserModel(
        id: prefs.getString('uid') ?? _uuid.v4(),
        email: stored,
        name: prefs.getString('uname') ?? 'User',
        role: _municipalityEmails.contains(stored)
            ? UserRole.municipality
            : UserRole.citizen,
        createdAt: DateTime.now(),
        isPremium: prefs.getBool('upremium') ?? false,
        reportsSubmitted: prefs.getInt('ureports') ?? 0,
        parkingSessions: prefs.getInt('usessions') ?? 0,
      );
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 900));

    _isLoading = false;

    if (email.isEmpty || password.length < 6) {
      _error = 'Invalid credentials. Please try again.';
      notifyListeners();
      return false;
    }

    final role = _municipalityEmails.contains(email.toLowerCase().trim())
        ? UserRole.municipality
        : UserRole.citizen;

    _user = UserModel(
      id: _uuid.v4(),
      email: email.toLowerCase().trim(),
      name: _nameFromEmail(email),
      role: role,
      createdAt: DateTime.now(),
      reportsSubmitted: 3,
      parkingSessions: 7,
    );

    await _persistSession();
    NotificationService().addWelcomeNotification(_user!.name.split(' ').first);
    notifyListeners();
    return true;
  }

  Future<bool> register(String email, String password, String name) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 1000));

    _isLoading = false;

    if (email.isEmpty || password.length < 6 || name.trim().isEmpty) {
      _error = 'Please fill all fields correctly.';
      notifyListeners();
      return false;
    }

    _user = UserModel(
      id: _uuid.v4(),
      email: email.toLowerCase().trim(),
      name: name.trim(),
      role: UserRole.citizen,
      createdAt: DateTime.now(),
    );

    await _persistSession();
    NotificationService().addWelcomeNotification(name.split(' ').first);
    notifyListeners();
    return true;
  }

  Future<void> updateProfile({String? name, String? phone}) async {
    if (_user == null) return;
    _user = _user!.copyWith(name: name, phone: phone);
    await _persistSession();
    notifyListeners();
  }

  Future<void> upgradeToPremium() async {
    if (_user == null) return;
    _user = _user!.copyWith(isPremium: true);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('upremium', true);
    notifyListeners();
  }

  void incrementReports() {
    if (_user == null) return;
    _user = _user!.copyWith(reportsSubmitted: _user!.reportsSubmitted + 1);
    SharedPreferences.getInstance()
        .then((p) => p.setInt('ureports', _user!.reportsSubmitted));
    notifyListeners();
  }

  void incrementSessions() {
    if (_user == null) return;
    _user = _user!.copyWith(parkingSessions: _user!.parkingSessions + 1);
    SharedPreferences.getInstance()
        .then((p) => p.setInt('usessions', _user!.parkingSessions));
    notifyListeners();
  }

  Future<void> _persistSession() async {
    if (_user == null) return;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kUserKey, _user!.email);
    await prefs.setString('uid', _user!.id);
    await prefs.setString('uname', _user!.name);
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kUserKey);
    await prefs.remove('uid');
    await prefs.remove('uname');
    _user = null;
    notifyListeners();
  }

  String _nameFromEmail(String email) {
    final local = email.split('@').first;
    return local
        .split('.')
        .map((p) => p.isNotEmpty
            ? '${p[0].toUpperCase()}${p.substring(1)}'
            : '')
        .join(' ');
  }
}
