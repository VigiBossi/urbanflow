import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import 'core/di/app_dependencies.dart';
import 'core/routing/app_router.dart';
import 'core/theme/app_theme.dart';
import 'l10n/generated/app_localizations.dart';
import 'providers/assistant_provider.dart';
import 'providers/auth_provider.dart';
import 'providers/dashboard_provider.dart';
import 'providers/location_provider.dart';
import 'providers/map_provider.dart';
import 'providers/parking_provider.dart';
import 'providers/report_provider.dart';
import 'providers/settings_provider.dart';

/// Root widget: wires providers, theming, localization and routing.
class UrbanFlowApp extends StatelessWidget {
  const UrbanFlowApp({super.key, required this.dependencies});

  final AppDependencies dependencies;

  @override
  Widget build(BuildContext context) {
    final deps = dependencies;
    return MultiProvider(
      providers: [
        Provider<AppDependencies>.value(value: deps),
        ChangeNotifierProvider(create: (_) => SettingsProvider(deps.store)),
        ChangeNotifierProvider(
          create: (_) =>
              AuthProvider(repository: deps.authRepository, store: deps.store)
                ..restoreSession(),
        ),
        ChangeNotifierProvider(
          create: (_) => LocationProvider(deps.locationService),
        ),
        ChangeNotifierProxyProvider<LocationProvider, ParkingProvider>(
          create: (_) => ParkingProvider(repository: deps.parkingRepository),
          update: (_, location, parking) =>
              parking!..updateOrigin(location.position),
        ),
        ChangeNotifierProvider(
          create: (_) => ReportProvider(deps.reportRepository),
        ),
        ChangeNotifierProvider(
          create: (_) => DashboardProvider(
            reportRepository: deps.reportRepository,
            parkingRepository: deps.parkingRepository,
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => MapProvider(deps.reportRepository),
        ),
        ChangeNotifierProvider(
          create: (_) => AssistantProvider(deps.assistantEngine),
        ),
      ],
      child: Consumer<SettingsProvider>(
        builder: (context, settings, _) => MaterialApp(
          onGenerateTitle: (context) => AppLocalizations.of(context).appName,
          debugShowCheckedModeBanner: false,
          theme: AppTheme.light,
          darkTheme: AppTheme.dark,
          themeMode: settings.themeMode,
          locale: settings.locale,
          supportedLocales: AppLocalizations.supportedLocales,
          localizationsDelegates: const [
            AppLocalizations.delegate,
            ...GlobalMaterialLocalizations.delegates,
          ],
          home: const RootGate(),
          onGenerateRoute: AppRouter.onGenerateRoute,
        ),
      ),
    );
  }
}
