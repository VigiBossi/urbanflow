import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/utils/l10n_ext.dart';
import '../../../l10n/generated/app_localizations.dart';
import '../../../providers/settings_provider.dart';

/// Native names of the supported languages.
String languageName(AppLocalizations l10n, String code) => switch (code) {
  'sq' => l10n.langAlbanian,
  'mk' => l10n.langMacedonian,
  'tr' => l10n.langTurkish,
  _ => l10n.langEnglish,
};

/// App bar button for switching the language at runtime.
class LanguageMenuButton extends StatelessWidget {
  const LanguageMenuButton({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final current = Localizations.localeOf(context).languageCode;
    return PopupMenuButton<Locale>(
      tooltip: l10n.languageLabel,
      icon: const Icon(Icons.translate),
      onSelected: (locale) =>
          context.read<SettingsProvider>().setLocale(locale),
      itemBuilder: (context) => [
        for (final locale in SettingsProvider.supportedLocales)
          CheckedPopupMenuItem<Locale>(
            value: locale,
            checked: locale.languageCode == current,
            child: Text(languageName(l10n, locale.languageCode)),
          ),
      ],
    );
  }
}
