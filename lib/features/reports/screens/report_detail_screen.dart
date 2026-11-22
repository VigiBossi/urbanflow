import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../core/widgets/responsive.dart';
import '../../../core/widgets/section_header.dart';
import '../../../core/widgets/state_views.dart';
import '../../../providers/report_provider.dart';
import '../widgets/report_info.dart';
import '../widgets/status_timeline.dart';

/// Citizen view of a single report with its progress.
class ReportDetailScreen extends StatelessWidget {
  const ReportDetailScreen({super.key, required this.reportId});

  final String reportId;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final provider = context.watch<ReportProvider>();
    final report = provider.byId(reportId);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.reportDetails)),
      body: report == null
          ? ErrorView(onRetry: provider.refresh)
          : RefreshIndicator(
              onRefresh: provider.refresh,
              child: ListView(
                padding: EdgeInsets.all(Responsive.pagePadding(context)),
                children: [
                  MaxWidthBox(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        ReportInfo(report: report),
                        SectionHeader(title: l10n.progressLabel),
                        StatusTimeline(report: report),
                        SectionHeader(title: l10n.municipalityNotes),
                        ReportNotesList(notes: report.notes),
                        const SizedBox(height: Spacing.xl),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
