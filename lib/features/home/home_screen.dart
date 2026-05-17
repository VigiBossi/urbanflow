import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../core/models/parking_spot_model.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/providers/payment_provider.dart';
import '../../core/providers/parking_provider.dart';
import '../../core/providers/reports_provider.dart';
import '../parking/parking_map_screen.dart';
import '../parking/parking_detail_screen.dart';
import '../reports/reports_list_screen.dart';
import '../reports/create_report_screen.dart';
import '../city_map/city_map_screen.dart';
import '../municipality/municipality_dashboard_screen.dart';
import '../notifications/notifications_screen.dart';
import '../parking/payment_history_screen.dart';
import '../ai_assistant/ai_chat_screen.dart';
import '../../core/services/notification_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ParkingProvider>().loadNearbySpots();
      context.read<ReportsProvider>().loadReports();
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final l10n = AppLocalizations.of(context);
    final isMuni = auth.isMunicipality;

    final tabs = [
      const _HomeTab(),
      const ParkingMapScreen(),
      const ReportsListScreen(),
      const CityMapScreen(),
      if (isMuni) const MunicipalityDashboardScreen(),
    ];

    return Scaffold(
      body: IndexedStack(index: _selectedIndex, children: tabs),
      bottomNavigationBar: _buildNavBar(l10n, isMuni),
    );
  }

  Widget _buildNavBar(AppLocalizations l10n, bool isMuni) {
    final items = [
      BottomNavigationBarItem(
          icon: const Icon(Icons.home_outlined),
          activeIcon: const Icon(Icons.home),
          label: l10n.home),
      BottomNavigationBarItem(
          icon: const Icon(Icons.local_parking_outlined),
          activeIcon: const Icon(Icons.local_parking),
          label: l10n.parking),
      BottomNavigationBarItem(
          icon: const Icon(Icons.report_problem_outlined),
          activeIcon: const Icon(Icons.report_problem),
          label: l10n.reports),
      BottomNavigationBarItem(
          icon: const Icon(Icons.map_outlined),
          activeIcon: const Icon(Icons.map),
          label: l10n.map),
      if (isMuni)
        BottomNavigationBarItem(
            icon: const Icon(Icons.admin_panel_settings_outlined),
            activeIcon: const Icon(Icons.admin_panel_settings),
            label: l10n.dashboard),
    ];

    return BottomNavigationBar(
      currentIndex: _selectedIndex,
      onTap: (i) => setState(() => _selectedIndex = i),
      items: items,
      type: BottomNavigationBarType.fixed,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: Colors.grey,
      backgroundColor: Colors.white,
      elevation: 12,
      selectedFontSize: 11,
      unselectedFontSize: 11,
    );
  }
}

class _HomeTab extends StatelessWidget {
  const _HomeTab();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final parking = context.watch<ParkingProvider>();
    final reports = context.watch<ReportsProvider>();
    final payment = context.watch<PaymentProvider>();
    final l10n = AppLocalizations.of(context);
    final user = auth.user;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FF),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.push(context,
            MaterialPageRoute(builder: (_) => const AiChatScreen())),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.auto_awesome, color: Colors.white, size: 18),
        label: const Text('AI Assistant',
            style:
                TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
        elevation: 6,
      ),
      body: CustomScrollView(
        slivers: [
          _buildSliverAppBar(context, l10n, user?.name.split(' ').first ?? 'there'),
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                if (payment.hasActiveSession) ...[
                  _ActiveSessionCard(session: payment.activeSession!),
                  const SizedBox(height: 16),
                ],
                _StatsRow(
                  reportsCount: user?.reportsSubmitted ?? 0,
                  sessionsCount: user?.parkingSessions ?? 0,
                  pendingCount: reports.allReports
                      .where((r) => r.userId == (user?.id ?? '') &&
                          r.status.name == 'pending')
                      .length,
                ),
                const SizedBox(height: 20),
                _SectionTitle(l10n.quickActions),
                const SizedBox(height: 12),
                _QuickActionsGrid(l10n: l10n, isMuni: auth.isMunicipality),
                const SizedBox(height: 20),
                if (parking.aiRecommendedSpot != null) ...[
                  _SectionTitle('${l10n.aiRecommendation} for You'),
                  const SizedBox(height: 12),
                  _AiParkingCard(spot: parking.aiRecommendedSpot!),
                  const SizedBox(height: 20),
                ],
                _SectionTitle('Recent City Reports'),
                const SizedBox(height: 12),
                ...reports.reports.take(3).map((r) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _ReportPreviewCard(report: r),
                )),
                const SizedBox(height: 80),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSliverAppBar(
      BuildContext context, AppLocalizations l10n, String firstName) {
    final unread = NotificationService().unreadCount;
    return SliverAppBar(
      expandedHeight: 140,
      floating: false,
      pinned: true,
      backgroundColor: AppColors.primary,
      foregroundColor: Colors.white,
      actions: [
        Stack(
          children: [
            IconButton(
              icon: const Icon(Icons.notifications_outlined),
              onPressed: () => Navigator.push(context,
                  MaterialPageRoute(
                      builder: (_) => const NotificationsScreen())),
            ),
            if (unread > 0)
              Positioned(
                right: 8,
                top: 8,
                child: Container(
                  width: 16,
                  height: 16,
                  decoration: const BoxDecoration(
                      color: Colors.red, shape: BoxShape.circle),
                  child: Center(
                    child: Text(
                      unread > 9 ? '9+' : '$unread',
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ),
          ],
        ),
        IconButton(
          icon: const Icon(Icons.person_outline),
          onPressed: () {
            // Navigate to profile tab or screen
          },
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [AppColors.primary, Color(0xFF1565C0)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 60, 20, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(
                  l10n.greeting(firstName),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Your city is live and up to date.',
                  style: TextStyle(
                      color: Colors.white.withOpacity(0.85), fontSize: 13),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  final int reportsCount;
  final int sessionsCount;
  final int pendingCount;

  const _StatsRow({
    required this.reportsCount,
    required this.sessionsCount,
    required this.pendingCount,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _StatCard(
          value: '$reportsCount',
          label: 'Reports',
          icon: Icons.report_problem_outlined,
          color: AppColors.secondary,
        ),
        const SizedBox(width: 12),
        _StatCard(
          value: '$sessionsCount',
          label: 'Parkings',
          icon: Icons.local_parking,
          color: AppColors.primary,
        ),
        const SizedBox(width: 12),
        _StatCard(
          value: '$pendingCount',
          label: 'Pending',
          icon: Icons.schedule,
          color: AppColors.warning,
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.value,
    required this.label,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 6),
            Text(value,
                style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: color)),
            Text(label,
                style:
                    TextStyle(fontSize: 11, color: Colors.grey[600])),
          ],
        ),
      ),
    );
  }
}

class _QuickActionsGrid extends StatelessWidget {
  final AppLocalizations l10n;
  final bool isMuni;

  const _QuickActionsGrid({required this.l10n, required this.isMuni});

  @override
  Widget build(BuildContext context) {
    final actions = [
      _QA(
        icon: Icons.local_parking,
        label: l10n.findParking,
        color: AppColors.primary,
        gradient: const [Color(0xFF1565C0), Color(0xFF1E88E5)],
        onTap: () => Navigator.push(
            context, MaterialPageRoute(builder: (_) => const ParkingMapScreen())),
      ),
      _QA(
        icon: Icons.report_problem_outlined,
        label: l10n.reportIssue,
        color: AppColors.error,
        gradient: const [Color(0xFFE53935), Color(0xFFEF5350)],
        onTap: () => Navigator.push(
            context, MaterialPageRoute(builder: (_) => const CreateReportScreen())),
      ),
      _QA(
        icon: Icons.map_outlined,
        label: l10n.liveMap,
        color: const Color(0xFF00897B),
        gradient: const [Color(0xFF00796B), Color(0xFF00897B)],
        onTap: () => Navigator.push(
            context, MaterialPageRoute(builder: (_) => const CityMapScreen())),
      ),
      if (isMuni)
        _QA(
          icon: Icons.admin_panel_settings_outlined,
          label: l10n.dashboard,
          color: const Color(0xFF7B1FA2),
          gradient: const [Color(0xFF6A1B9A), Color(0xFF8E24AA)],
          onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (_) => const MunicipalityDashboardScreen())),
        )
      else
        _QA(
          icon: Icons.history,
          label: l10n.paymentHistory,
          color: const Color(0xFF00897B),
          gradient: const [Color(0xFF00796B), Color(0xFF00897B)],
          onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (_) => const PaymentHistoryScreen())),
        ),
    ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: actions.map((a) => _QuickActionCard(qa: a)).toList(),
    );
  }
}

class _QA {
  final IconData icon;
  final String label;
  final Color color;
  final List<Color> gradient;
  final VoidCallback onTap;
  const _QA({
    required this.icon,
    required this.label,
    required this.color,
    required this.gradient,
    required this.onTap,
  });
}

class _QuickActionCard extends StatelessWidget {
  final _QA qa;
  const _QuickActionCard({required this.qa});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: qa.onTap,
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
              colors: qa.gradient,
              begin: Alignment.topLeft,
              end: Alignment.bottomRight),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: qa.color.withOpacity(0.3),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: qa.onTap,
            borderRadius: BorderRadius.circular(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(qa.icon, color: Colors.white, size: 22),
                  ),
                  Text(
                    qa.label,
                    style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 13),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _AiParkingCard extends StatelessWidget {
  final ParkingSpot spot;
  const _AiParkingCard({required this.spot});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        context.read<ParkingProvider>().selectSpot(spot);
        Navigator.push(context,
            MaterialPageRoute(builder: (_) => ParkingDetailScreen(spot: spot)));
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF1565C0), Color(0xFF0288D1)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.35),
              blurRadius: 14,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.auto_awesome, color: Colors.white, size: 13),
                      SizedBox(width: 4),
                      Text('AI Best Pick',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                const Spacer(),
                if (spot.aiScore != null)
                  Text(
                    'Score: ${spot.aiScore!.round()}',
                    style: TextStyle(
                        color: Colors.white.withOpacity(0.8), fontSize: 12),
                  ),
              ],
            ),
            const SizedBox(height: 10),
            Text(spot.name,
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold)),
            Text(spot.address,
                style: TextStyle(
                    color: Colors.white.withOpacity(0.8), fontSize: 12)),
            const SizedBox(height: 10),
            Row(
              children: [
                _InfoChip(
                    icon: Icons.directions_walk,
                    label:
                        '${spot.walkingMinutes ?? "?"} min'),
                const SizedBox(width: 8),
                _InfoChip(
                    icon: Icons.attach_money,
                    label: spot.formattedPrice),
                const SizedBox(width: 8),
                _InfoChip(
                    icon: Icons.local_parking,
                    label:
                        '${spot.availableSpots} spots'),
              ],
            ),
            if (spot.aiReason != null) ...[
              const SizedBox(height: 10),
              Text(
                spot.aiReason!,
                style: TextStyle(
                    color: Colors.white.withOpacity(0.75),
                    fontSize: 11,
                    fontStyle: FontStyle.italic),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _InfoChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.15),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.white, size: 12),
          const SizedBox(width: 4),
          Text(label,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class _ActiveSessionCard extends StatelessWidget {
  final dynamic session;
  const _ActiveSessionCard({required this.session});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
            color: session.isExpiringSoon
                ? AppColors.warning
                : AppColors.success,
            width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.local_parking,
                  color: AppColors.primary, size: 20),
              const SizedBox(width: 8),
              Text(l10n.activeParking,
                  style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: session.isExpiringSoon
                      ? AppColors.warning.withOpacity(0.15)
                      : AppColors.success.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  session.formattedRemaining,
                  style: TextStyle(
                    color: session.isExpiringSoon
                        ? AppColors.warning
                        : AppColors.success,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(session.parkingSpotName,
              style: const TextStyle(
                  fontSize: 15, fontWeight: FontWeight.w600)),
          Text(session.parkingSpotAddress,
              style: TextStyle(fontSize: 12, color: Colors.grey[600])),
          const SizedBox(height: 10),
          LinearProgressIndicator(
            value: session.progressFraction,
            backgroundColor: Colors.grey[200],
            valueColor: AlwaysStoppedAnimation(
              session.isExpiringSoon ? AppColors.warning : AppColors.primary,
            ),
            borderRadius: BorderRadius.circular(4),
            minHeight: 6,
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () =>
                      context.read<PaymentProvider>().extendSession(30),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.primary),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                  ),
                  child: Text(l10n.extendTime,
                      style: const TextStyle(fontSize: 12)),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton(
                  onPressed: () =>
                      context.read<PaymentProvider>().endSession(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.error,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                  ),
                  child: Text(l10n.endSession,
                      style: const TextStyle(fontSize: 12)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ReportPreviewCard extends StatelessWidget {
  final dynamic report;
  const _ReportPreviewCard({required this.report});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: report.statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(report.categoryIcon,
                color: report.statusColor, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(report.title,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 13),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                Text(report.address ?? '',
                    style:
                        TextStyle(fontSize: 11, color: Colors.grey[600]),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(report.statusEmoji,
                  style: const TextStyle(fontSize: 16)),
              Text(
                '${report.upvotes} votes',
                style: TextStyle(fontSize: 10, color: Colors.grey[500]),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle(this.title);

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Colors.black87,
          letterSpacing: 0.2),
    );
  }
}
