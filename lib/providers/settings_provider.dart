import 'package:material_ui/material_ui.dart';

import '../core/constants/app_constants.dart';
import '../data/services/local_store.dart';
import '../l10n/generated/app_localizations.dart';

/// Language and theme preferences, persisted locally.
class SettingsProvider extends ChangeNotifier {
  SettingsProvider(this._store) {
    final code = _store.getString(StorageKeys.locale);
    if (code != null && _isSupported(code)) _locale = Locale(code);
    final theme = _store.getString(StorageKeys.themeMode);
    if (theme != null) {
      _themeMode = ThemeMode.values.firstWhere(
        (m) => m.name == theme,
        orElse: () => ThemeMode.system,
      );
    }
  }

  final LocalStore _store;
  Locale? _locale;
  ThemeMode _themeMode = ThemeMode.system;

  /// Selected locale, or null to follow the device language.
  Locale? get locale => _locale;
  ThemeMode get themeMode => _themeMode;

  static List<Locale> get supportedLocales => AppLocalizations.supportedLocales;

  static bool _isSupported(String code) =>
      supportedLocales.any((l) => l.languageCode == code);

  Future<void> setLocale(Locale locale) async {
    if (!_isSupported(locale.languageCode) || locale == _locale) return;
    _locale = Locale(locale.languageCode);
    notifyListeners();
    await _store.setString(StorageKeys.locale, locale.languageCode);
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    if (mode == _themeMode) return;
    _themeMode = mode;
    notifyListeners();
    await _store.setString(StorageKeys.themeMode, mode.name);
  }
}
