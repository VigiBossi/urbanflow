import 'package:latlong2/latlong.dart';
import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../data/models/parking_spot.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/splash_screen.dart';
import '../../features/parking/screens/active_session_screen.dart';
import '../../features/parking/screens/payment_screen.dart';
import '../../features/reports/screens/admin_report_detail_screen.dart';
import '../../features/reports/screens/create_report_screen.dart';
import '../../features/reports/screens/location_picker_screen.dart';
import '../../features/reports/screens/report_detail_screen.dart';
import '../../features/settings/screens/settings_screen.dart';
import '../../features/shell/screens/citizen_shell.dart';
import '../../features/shell/screens/municipality_shell.dart';
import '../../providers/auth_provider.dart';

/// Named routes and their arguments.
abstract final class AppRoutes {
  static const String payment = '/parking/pay'; // args: ParkingSpot
  static const String activeSession = '/parking/session';
  static const String createReport = '/reports/new';
  static const String reportDetail = '/reports/detail'; // args: report id
  static const String adminReportDetail = '/manage/report'; // args: report id
  static const String locationPicker = '/location'; // args: LatLng?
  static const String settings = '/settings';
}

abstract final class AppRouter {
  static Route<dynamic>? onGenerateRoute(RouteSettings settings) {
    final args = settings.arguments;
    final Widget? page = switch (settings.name) {
      AppRoutes.payment when args is ParkingSpot => PaymentScreen(spot: args),
      AppRoutes.activeSession => const ActiveSessionScreen(),
      AppRoutes.createReport => const CreateReportScreen(),
      AppRoutes.reportDetail when args is String => ReportDetailScreen(
        reportId: args,
      ),
      AppRoutes.adminReportDetail when args is String =>
        AdminReportDetailScreen(reportId: args),
      AppRoutes.locationPicker => LocationPickerScreen(
        initial: args is LatLng ? args : null,
      ),
      AppRoutes.settings => const SettingsScreen(),
      _ => null,
    };
    if (page == null) return null;
    return MaterialPageRoute<dynamic>(
      settings: settings,
      builder: (_) => page,
      fullscreenDialog: settings.name == AppRoutes.createReport,
    );
  }
}

/// Chooses the first screen based on authentication state and role.
class RootGate extends StatelessWidget {
  const RootGate({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
    final Widget child = switch (auth.status) {
      AuthStatus.unknown => const SplashScreen(),
      AuthStatus.authenticated when user != null =>
        user.isMunicipality
            ? MunicipalityShell(key: ValueKey(user.id))
            : CitizenShell(key: ValueKey(user.id)),
      _ => const LoginScreen(),
    };
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      child: child,
    );
  }
}
