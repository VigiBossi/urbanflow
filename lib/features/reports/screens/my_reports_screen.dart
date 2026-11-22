import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/routing/app_router.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../core/widgets/responsive.dart';
import '../../../core/widgets/state_views.dart';
import '../../../providers/report_provider.dart';
import '../../../providers/view_status.dart';
import '../widgets/report_card.dart';

/// Citizen view: list of own reports with status tracking.
class MyReportsScreen extends StatelessWidget {
  const MyReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final provider = context.watch<ReportProvider>();
    final reports = provider.reports;

    Widget body;
    if (provider.status == ViewStatus.error) {
      body = ErrorView(onRetry: provider.refresh);
    } else if (provider.status != ViewStatus.ready && reports.isEmpty) {
      body = const LoadingView();
    } else if (reports.isEmpty) {
      body = EmptyView(
        icon: Icons.campaign_outlined,
        title: l10n.noReportsTitle,
        message: l10n.noReportsMessage,
      );
    } else {
      final columns = Responsive.isExpanded(context) ? 2 : 1;
      body = RefreshIndicator(
        onRefresh: provider.refresh,
        child: GridView.builder(
          padding: EdgeInsets.fromLTRB(
            Responsive.pagePadding(context),
            Spacing.sm,
            Responsive.pagePadding(context),
            96,
          ),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: columns,
            mainAxisSpacing: Spacing.sm,
            crossAxisSpacing: Spacing.sm,
            mainAxisExtent: 128,
          ),
          itemCount: reports.length,
          itemBuilder: (context, i) => ReportCard(
            report: reports[i],
            onTap: () => Navigator.of(context)
                .pushNamed(AppRoutes.reportDetail, arguments: reports[i].id),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(l10n.myReports)),
      body: body,
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'new-report',
        onPressed: () =>
            Navigator.of(context).pushNamed(AppRoutes.createReport),
        icon: const Icon(Icons.add),
        label: Text(l10n.newReport),
      ),
    );
  }
}
