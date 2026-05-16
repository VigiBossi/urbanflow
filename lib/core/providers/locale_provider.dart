import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocaleProvider extends ChangeNotifier {
  Locale _locale = const Locale('en');
  static const _kLocaleKey = 'urbanflow_locale';

  Locale get locale => _locale;

  LocaleProvider() {
    _loadSavedLocale();
  }

  Future<void> _loadSavedLocale() async {
    final prefs = await SharedPreferences.getInstance();
    final code = prefs.getString(_kLocaleKey) ?? 'en';
    _locale = Locale(code);
    notifyListeners();
  }

  Future<void> setLocale(String languageCode) async {
    if (_locale.languageCode == languageCode) return;
    _locale = Locale(languageCode);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kLocaleKey, languageCode);
    notifyListeners();
  }

  String get languageName {
    switch (_locale.languageCode) {
      case 'sq':
        return 'Shqip';
      case 'mk':
        return 'Македонски';
      case 'tr':
        return 'Türkçe';
      default:
        return 'English';
    }
  }

  static const languageOptions = [
    {'code': 'en', 'name': 'English', 'native': 'English', 'flag': '🇬🇧'},
    {'code': 'sq', 'name': 'Albanian', 'native': 'Shqip', 'flag': '🇦🇱'},
    {'code': 'mk', 'name': 'Macedonian', 'native': 'Македонски', 'flag': '🇲🇰'},
    {'code': 'tr', 'name': 'Turkish', 'native': 'Türkçe', 'flag': '🇹🇷'},
  ];
}
