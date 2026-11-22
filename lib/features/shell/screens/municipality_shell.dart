import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/utils/l10n_ext.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/dashboard_provider.dart';
import '../../../providers/location_provider.dart';
import '../../../providers/parking_provider.dart';
import '../../../providers/report_provider.dart';
import '../../assistant/screens/assistant_screen.dart';
import '../../dashboard/screens/dashboard_screen.dart';
import '../../map/screens/city_map_screen.dart';
import '../../reports/screens/manage_reports_screen.dart';
import '../../settings/screens/settings_screen.dart';
import '../widgets/adaptive_shell.dart';

/// Home for municipality staff: dashboard, report management, map,
/// assistant and profile.
class MunicipalityShell extends StatefulWidget {
  const MunicipalityShell({super.key});

  @override
  State<MunicipalityShell> createState() => _MunicipalityShellState();
}

class _MunicipalityShellState extends State<MunicipalityShell> {
  final _shellKey = GlobalKey<AdaptiveShellState>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = context.read<AuthProvider>().user;
      if (user == null) return;
      context.read<LocationProvider>().refresh();
      context.read<ParkingProvider>().start(user.id);
      context.read<ReportProvider>().load(user);
      context.read<DashboardProvider>().load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return AdaptiveShell(
      key: _shellKey,
      destinations: [
        ShellDestination(
          icon: Icons.dashboard_outlined,
          selectedIcon: Icons.dashboard,
          label: l10n.navDashboard,
          builder: (_) => DashboardScreen(
            onViewAllReports: () => _shellKey.currentState?.select(1),
          ),
        ),
        ShellDestination(
          icon: Icons.assignment_outlined,
          selectedIcon: Icons.assignment,
          label: l10n.navManage,
          builder: (_) => const ManageReportsScreen(),
        ),
        ShellDestination(
          icon: Icons.map_outlined,
          selectedIcon: Icons.map,
          label: l10n.navMap,
          builder: (_) => const CityMapScreen(),
        ),
        ShellDestination(
          icon: Icons.smart_toy_outlined,
          selectedIcon: Icons.smart_toy,
          label: l10n.navAssistant,
          builder: (_) => const AssistantScreen(),
        ),
        ShellDestination(
          icon: Icons.person_outline,
          selectedIcon: Icons.person,
          label: l10n.navProfile,
          builder: (_) => const SettingsScreen(embedded: true),
        ),
      ],
    );
  }
}
