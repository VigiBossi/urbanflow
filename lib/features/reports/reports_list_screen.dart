import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../core/models/report_model.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/providers/reports_provider.dart';
import '../../shared/widgets/status_badge.dart';
import 'report_detail_screen.dart';
import 'create_report_screen.dart';

class ReportsListScreen extends StatefulWidget {
  const ReportsListScreen({super.key});

  @override
  State<ReportsListScreen> createState() => _ReportsListScreenState();
}

class _ReportsListScreenState extends State<ReportsListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 5, vsync: this);
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final reports = context.watch<ReportsProvider>();
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.reports),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        bottom: TabBar(
          controller: _tabCtrl,
          isScrollable: true,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          labelStyle: const TextStyle(
              fontSize: 12, fontWeight: FontWeight.w600),
          tabs: [
            Tab(text: l10n.allReports),
            Tab(text: l10n.myReports),
            Tab(text: l10n.pending),
            Tab(text: l10n.inProgress),
            Tab(text: l10n.resolved),
          ],
          onTap: (i) {
            final statuses = [
              null,
              null,
              ReportStatus.pending,
              ReportStatus.inProgress,
              ReportStatus.resolved,
            ];
            reports.setFilters(status: statuses[i]);
          },
        ),
      ),
      body: Column(
        children: [
          _buildSearchBar(l10n, reports),
          Expanded(
            child: TabBarView(
              controller: _tabCtrl,
              children: [
                _ReportsList(
                    reports: reports.reports, l10n: l10n),
                _ReportsList(
                    reports: reports.myReports(auth.user?.id ?? ''),
                    l10n: l10n),
                _ReportsList(
                    reports: reports.reports
                        .where((r) => r.status == ReportStatus.pending)
                        .toList(),
                    l10n: l10n),
                _ReportsList(
                    reports: reports.reports
                        .where((r) => r.status == ReportStatus.inProgress)
                        .toList(),
                    l10n: l10n),
                _ReportsList(
                    reports: reports.reports
                        .where((r) => r.status == ReportStatus.resolved)
                        .toList(),
                    l10n: l10n),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.push(context,
            MaterialPageRoute(builder: (_) => const CreateReportScreen())),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text(l10n.createReport,
            style: const TextStyle(color: Colors.white)),
      ),
    );
  }

  Widget _buildSearchBar(AppLocalizations l10n, ReportsProvider reports) {
    return Container(
      color: AppColors.primary,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: TextField(
        controller: _searchCtrl,
        onChanged: reports.setSearchQuery,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          hintText: '${l10n.search} reports...',
          hintStyle: const TextStyle(color: Colors.white60),
          prefixIcon:
              const Icon(Icons.search, color: Colors.white70, size: 20),
          suffixIcon: _searchCtrl.text.isNotEmpty
              ? IconButton(
                  icon:
                      const Icon(Icons.clear, color: Colors.white70, size: 18),
                  onPressed: () {
                    _searchCtrl.clear();
                    reports.setSearchQuery('');
                  },
                )
              : null,
          filled: true,
          fillColor: Colors.white.withOpacity(0.15),
          border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide.none),
          enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide.none),
          focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide.none),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        ),
      ),
    );
  }
}

class _ReportsList extends StatelessWidget {
  final List<Report> reports;
  final AppLocalizations l10n;

  const _ReportsList({required this.reports, required this.l10n});

  @override
  Widget build(BuildContext context) {
    if (reports.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.report_problem_outlined,
                size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text(l10n.noReports,
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey[500])),
            const SizedBox(height: 8),
            Text(l10n.noReportsSubtitle,
                style: TextStyle(
                    fontSize: 13, color: Colors.grey[400]),
                textAlign: TextAlign.center),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: reports.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (ctx, i) => _ReportCard(report: reports[i], l10n: l10n),
    );
  }
}

class _ReportCard extends StatelessWidget {
  final Report report;
  final AppLocalizations l10n;

  const _ReportCard({required this.report, required this.l10n});

  @override
  Widget build(BuildContext context) {
    final auth = context.read<AuthProvider>();

    return GestureDetector(
      onTap: () => Navigator.push(context,
          MaterialPageRoute(
              builder: (_) => ReportDetailScreen(report: report))),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 8,
                offset: const Offset(0, 2)),
          ],
          border: report.isHighPriority
              ? Border.all(
                  color: AppColors.error.withOpacity(0.4))
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: report.statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(report.categoryIcon,
                      color: report.statusColor, size: 20),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(report.title,
                          style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 14),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis),
                      Text(report.categoryLabel,
                          style: TextStyle(
                              fontSize: 11, color: Colors.grey[500])),
                    ],
                  ),
                ),
                StatusBadge.reportStatus(report.status),
              ],
            ),
            if (report.description.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(report.description,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style:
                      TextStyle(fontSize: 12, color: Colors.grey[600])),
            ],
            const SizedBox(height: 10),
            Row(
              children: [
                const Icon(Icons.location_on_outlined,
                    size: 12, color: Colors.grey),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(report.address ?? '',
                      style: TextStyle(
                          fontSize: 11, color: Colors.grey[600]),
                      overflow: TextOverflow.ellipsis),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.access_time,
                    size: 12, color: Colors.grey),
                const SizedBox(width: 4),
                Text(timeago.format(report.createdAt),
                    style: TextStyle(
                        fontSize: 11, color: Colors.grey[500])),
                const Spacer(),
                GestureDetector(
                  onTap: () => context
                      .read<ReportsProvider>()
                      .upvoteReport(report.id, auth.user?.id ?? ''),
                  child: Row(
                    children: [
                      Icon(
                        report.upvotedByUserIds
                                .contains(auth.user?.id ?? '')
                            ? Icons.thumb_up
                            : Icons.thumb_up_outlined,
                        size: 14,
                        color: report.upvotedByUserIds
                                .contains(auth.user?.id ?? '')
                            ? AppColors.primary
                            : Colors.grey,
                      ),
                      const SizedBox(width: 4),
                      Text('${report.upvotes}',
                          style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600])),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Row(
                  children: [
                    const Icon(Icons.comment_outlined,
                        size: 14, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text('${report.comments.length}',
                        style: TextStyle(
                            fontSize: 12, color: Colors.grey[600])),
                  ],
                ),
                if (report.isHighPriority) ...[
                  const SizedBox(width: 8),
                  const Icon(Icons.priority_high,
                      color: AppColors.error, size: 16),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}
