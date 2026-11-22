import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/utils/enum_labels.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../core/widgets/responsive.dart';
import '../../../core/widgets/section_header.dart';
import '../../../core/widgets/state_views.dart';
import '../../../data/models/city_report.dart';
import '../../../data/models/report_status_flow.dart';
import '../../../providers/report_provider.dart';
import '../widgets/report_info.dart';
import '../widgets/status_timeline.dart';

/// Municipality view of a report: prioritize, assign, change status, notes.
class AdminReportDetailScreen extends StatefulWidget {
  const AdminReportDetailScreen({super.key, required this.reportId});

  final String reportId;

  @override
  State<AdminReportDetailScreen> createState() =>
      _AdminReportDetailScreenState();
}

class _AdminReportDetailScreenState extends State<AdminReportDetailScreen> {
  final _noteController = TextEditingController();
  bool _saving = false;

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  Future<void> _run(
    Future<void> Function() action, {
    required String successMessage,
  }) async {
    final l10n = context.l10n;
    final messenger = ScaffoldMessenger.of(context);
    setState(() => _saving = true);
    try {
      await action();
      messenger.showSnackBar(SnackBar(content: Text(successMessage)));
    } on InvalidStatusTransition {
      messenger.showSnackBar(SnackBar(content: Text(l10n.invalidTransition)));
    } on Exception {
      messenger.showSnackBar(SnackBar(content: Text(l10n.networkError)));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final provider = context.watch<ReportProvider>();
    final report = provider.byId(widget.reportId);

    if (report == null) {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.reportDetails)),
        body: ErrorView(onRetry: provider.refresh),
      );
    }

    final info = ReportInfo(report: report, showPriority: true);
    final management = _ManagementPanel(
      report: report,
      saving: _saving,
      noteController: _noteController,
      onPriority: (p) => _run(
        () => provider.changePriority(report.id, p),
        successMessage: l10n.reportUpdated,
      ),
      onAssign: (id) => _run(
        () => provider.assign(report.id, id),
        successMessage: l10n.reportUpdated,
      ),
      onStatus: (s) => _run(
        () => provider.changeStatus(report.id, s),
        successMessage: l10n.reportUpdated,
      ),
      onAddNote: () {
        final text = _noteController.text.trim();
        if (text.isEmpty) return;
        _run(() async {
          await provider.addNote(report.id, text);
          _noteController.clear();
        }, successMessage: l10n.noteAdded);
      },
    );

    final padding = Responsive.pagePadding(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.reportDetails),
        bottom: _saving
            ? const PreferredSize(
                preferredSize: Size.fromHeight(4),
                child: LinearProgressIndicator(),
              )
            : null,
      ),
      body: Responsive.isExpanded(context)
          ? Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: ListView(
                    padding: EdgeInsets.all(padding),
                    children: [
                      info,
                      SectionHeader(title: l10n.progressLabel),
                      StatusTimeline(report: report),
                    ],
                  ),
                ),
                const VerticalDivider(width: 1),
                SizedBox(
                  width: 400,
                  child: ListView(
                    padding: EdgeInsets.all(padding),
                    children: [management],
                  ),
                ),
              ],
            )
          : ListView(
              padding: EdgeInsets.all(padding),
              children: [
                info,
                const SizedBox(height: Spacing.lg),
                management,
                SectionHeader(title: l10n.progressLabel),
                StatusTimeline(report: report),
              ],
            ),
    );
  }
}

class _ManagementPanel extends StatelessWidget {
  const _ManagementPanel({
    required this.report,
    required this.saving,
    required this.noteController,
    required this.onPriority,
    required this.onAssign,
    required this.onStatus,
    required this.onAddNote,
  });

  final CityReport report;
  final bool saving;
  final TextEditingController noteController;
  final ValueChanged<ReportPriority> onPriority;
  final ValueChanged<String?> onAssign;
  final ValueChanged<ReportStatus> onStatus;
  final VoidCallback onAddNote;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final theme = Theme.of(context);
    final provider = context.watch<ReportProvider>();
    final next = ReportStatusFlow.nextStatuses(report.status);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SectionHeader(title: l10n.priorityLabel),
        SegmentedButton<ReportPriority>(
          showSelectedIcon: false,
          segments: [
            for (final p in ReportPriority.values)
              ButtonSegment(
                value: p,
                label: Text(
                  p.label(l10n),
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(color: p.color),
                ),
              ),
          ],
          selected: {report.priority},
          onSelectionChanged: saving ? null : (s) => onPriority(s.first),
        ),
        SectionHeader(title: l10n.assignTo),
        DropdownButtonFormField<String?>(
          key: ValueKey('assignee-${report.assignedStaffId}'),
          initialValue: report.assignedStaffId,
          isExpanded: true,
          decoration: const InputDecoration(
            prefixIcon: Icon(Icons.engineering_outlined),
          ),
          items: [
            DropdownMenuItem<String?>(
              value: null,
              child: Text(l10n.unassigned),
            ),
            for (final s in provider.staff)
              DropdownMenuItem<String?>(
                value: s.id,
                child: Text(
                  '${s.name} · ${s.department.label(l10n)}',
                  overflow: TextOverflow.ellipsis,
                ),
              ),
          ],
          onChanged: saving
              ? null
              : (id) {
                  if (id != report.assignedStaffId) onAssign(id);
                },
        ),
        SectionHeader(title: l10n.changeStatus),
        if (next.isEmpty)
          Text(l10n.noStatusChanges, style: theme.textTheme.bodyMedium)
        else
          Wrap(
            spacing: Spacing.sm,
            runSpacing: Spacing.sm,
            children: [
              for (final s in next)
                FilledButton.tonalIcon(
                  onPressed: saving ? null : () => onStatus(s),
                  icon: Icon(s.icon, color: s.color),
                  label: Text(s.label(l10n)),
                ),
            ],
          ),
        SectionHeader(title: l10n.notesLabel),
        ReportNotesList(notes: report.notes),
        const SizedBox(height: Spacing.sm),
        TextField(
          controller: noteController,
          enabled: !saving,
          minLines: 2,
          maxLines: 4,
          decoration: InputDecoration(hintText: l10n.noteHint),
        ),
        const SizedBox(height: Spacing.sm),
        Align(
          alignment: Alignment.centerRight,
          child: FilledButton.icon(
            onPressed: saving ? null : onAddNote,
            icon: const Icon(Icons.note_add_outlined),
            label: Text(l10n.addNote),
          ),
        ),
      ],
    );
  }
}
