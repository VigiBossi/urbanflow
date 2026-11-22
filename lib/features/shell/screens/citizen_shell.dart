import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/utils/l10n_ext.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/location_provider.dart';
import '../../../providers/parking_provider.dart';
import '../../../providers/report_provider.dart';
import '../../assistant/screens/assistant_screen.dart';
import '../../map/screens/city_map_screen.dart';
import '../../parking/screens/parking_screen.dart';
import '../../reports/screens/my_reports_screen.dart';
import '../../settings/screens/settings_screen.dart';
import '../widgets/adaptive_shell.dart';
import '../widgets/parking_alert_listener.dart';
import '../widgets/session_banner.dart';

/// Home for citizens: parking, map, reports, assistant and profile.
class CitizenShell extends StatefulWidget {
  const CitizenShell({super.key});

  @override
  State<CitizenShell> createState() => _CitizenShellState();
}

class _CitizenShellState extends State<CitizenShell> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = context.read<AuthProvider>().user;
      if (user == null) return;
      context.read<LocationProvider>().refresh();
      context.read<ParkingProvider>().start(user.id);
      context.read<ReportProvider>().load(user);
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return AdaptiveShell(
      footer: const SessionBanner(),
      overlay: const ParkingAlertListener(),
      destinations: [
        ShellDestination(
          icon: Icons.local_parking_outlined,
          selectedIcon: Icons.local_parking,
          label: l10n.navParking,
          builder: (_) => const ParkingScreen(),
        ),
        ShellDestination(
          icon: Icons.map_outlined,
          selectedIcon: Icons.map,
          label: l10n.navMap,
          builder: (_) => const CityMapScreen(),
        ),
        ShellDestination(
          icon: Icons.campaign_outlined,
          selectedIcon: Icons.campaign,
          label: l10n.navReports,
          builder: (_) => const MyReportsScreen(),
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
