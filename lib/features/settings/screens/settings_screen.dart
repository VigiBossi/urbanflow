import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../core/widgets/responsive.dart';
import '../../../core/widgets/section_header.dart';
import '../../../providers/assistant_provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/parking_provider.dart';
import '../../../providers/report_provider.dart';
import '../../../providers/settings_provider.dart';
import '../../auth/widgets/language_menu_button.dart';

/// Profile, language, theme and logout.
class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key, this.embedded = false});

  /// True when shown as a tab (no back button).
  final bool embedded;

  Future<void> _logout(BuildContext context) async {
    final l10n = context.l10n;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.logoutConfirmTitle),
        content: Text(l10n.logoutConfirmMessage),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(l10n.cancel),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(l10n.logout),
          ),
        ],
      ),
    );
    if (confirmed != true || !context.mounted) return;
    context.read<ParkingProvider>().stop();
    context.read<ReportProvider>().reset();
    context.read<AssistantProvider>().clear();
    Navigator.of(context).popUntil((route) => route.isFirst);
    await context.read<AuthProvider>().logout();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final theme = Theme.of(context);
    final settings = context.watch<SettingsProvider>();
    final user = context.watch<AuthProvider>().user;
    final currentLanguage = Localizations.localeOf(context).languageCode;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.settingsTitle),
        automaticallyImplyLeading: !embedded,
      ),
      body: ListView(
        padding: EdgeInsets.all(Responsive.pagePadding(context)),
        children: [
          MaxWidthBox(
            maxWidth: 640,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (user != null)
                  Card(
                    child: ListTile(
                      contentPadding: const EdgeInsets.all(Spacing.md),
                      leading: CircleAvatar(
                        radius: 26,
                        backgroundColor: theme.colorScheme.primaryContainer,
                        child: Text(
                          user.name.isEmpty ? '?' : user.name[0],
                          style: theme.textTheme.titleLarge?.copyWith(
                            color: theme.colorScheme.onPrimaryContainer,
                          ),
                        ),
                      ),
                      title: Text(user.name),
                      subtitle: Text(
                        '${user.email}\n${user.isMunicipality ? l10n.roleMunicipality : l10n.roleCitizen}',
                      ),
                      isThreeLine: true,
                    ),
                  ),
                SectionHeader(title: l10n.languageLabel),
                Wrap(
                  spacing: Spacing.sm,
                  runSpacing: Spacing.sm,
                  children: [
                    for (final locale in SettingsProvider.supportedLocales)
                      ChoiceChip(
                        key: ValueKey('lang-${locale.languageCode}'),
                        label: Text(languageName(l10n, locale.languageCode)),
                        selected: currentLanguage == locale.languageCode,
                        onSelected: (_) => settings.setLocale(locale),
                      ),
                  ],
                ),
                SectionHeader(title: l10n.appearance),
                SegmentedButton<ThemeMode>(
                  segments: [
                    ButtonSegment(
                      value: ThemeMode.system,
                      icon: const Icon(Icons.brightness_auto_outlined),
                      label: Text(l10n.themeSystem),
                    ),
                    ButtonSegment(
                      value: ThemeMode.light,
                      icon: const Icon(Icons.light_mode_outlined),
                      label: Text(l10n.themeLight),
                    ),
                    ButtonSegment(
                      value: ThemeMode.dark,
                      icon: const Icon(Icons.dark_mode_outlined),
                      label: Text(l10n.themeDark),
                    ),
                  ],
                  selected: {settings.themeMode},
                  onSelectionChanged: (s) => settings.setThemeMode(s.first),
                ),
                SectionHeader(title: l10n.aboutLabel),
                Card(
                  child: ListTile(
                    leading: const Icon(Icons.info_outline),
                    title: Text(l10n.appName),
                    subtitle: Text(
                      '${l10n.aboutText}\n${l10n.versionLabel('1.0.0')}',
                    ),
                    isThreeLine: true,
                  ),
                ),
                const SizedBox(height: Spacing.xl),
                OutlinedButton.icon(
                  key: const Key('logout-button'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: theme.colorScheme.error,
                  ),
                  onPressed: () => _logout(context),
                  icon: const Icon(Icons.logout),
                  label: Text(l10n.logout),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
