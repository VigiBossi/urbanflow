import 'package:material_ui/material_ui.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/utils/enum_labels.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../data/models/city_report.dart';
import 'report_chips.dart';
import 'report_location_preview.dart';

/// Header, description, location and photo of a report.
class ReportInfo extends StatelessWidget {
  const ReportInfo({
    super.key,
    required this.report,
    this.showPriority = false,
  });

  final CityReport report;
  final bool showPriority;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = Formatters(l10n);
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            CategoryAvatar(category: report.category, size: 48),
            const SizedBox(width: Spacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    report.category.label(l10n),
                    style: theme.textTheme.titleLarge,
                  ),
                  Text(
                    l10n.reportedOn(fmt.dateTime(report.createdAt)),
                    style: theme.textTheme.bodySmall,
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: Spacing.md),
        Wrap(
          spacing: Spacing.sm,
          runSpacing: Spacing.xs,
          children: [
            StatusChip(status: report.status),
            if (showPriority) PriorityChip(priority: report.priority),
          ],
        ),
        const SizedBox(height: Spacing.lg),
        Text(report.description, style: theme.textTheme.bodyLarge),
        const SizedBox(height: Spacing.lg),
        ReportLocationPreview(
          position: report.position,
          category: report.category,
        ),
        const SizedBox(height: Spacing.sm),
        Row(
          children: [
            const Icon(Icons.place_outlined, size: 18),
            const SizedBox(width: Spacing.xs),
            Text('${l10n.neighborhoodLabel}: ${report.neighborhood}'),
          ],
        ),
        if (report.hasPhoto) ...[
          const SizedBox(height: Spacing.lg),
          Container(
            height: 140,
            width: double.infinity,
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.image_outlined,
                  size: 40,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                Text(l10n.photoAttached, style: theme.textTheme.bodySmall),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

/// List of municipality notes.
class ReportNotesList extends StatelessWidget {
  const ReportNotesList({super.key, required this.notes});

  final List<ReportNote> notes;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = Formatters(l10n);
    final theme = Theme.of(context);
    if (notes.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: Spacing.sm),
        child: Text(
          l10n.noNotes,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      );
    }
    return Column(
      children: [
        for (final note in notes.reversed)
          Card(
            margin: const EdgeInsets.only(bottom: Spacing.sm),
            child: ListTile(
              leading: const Icon(Icons.sticky_note_2_outlined),
              title: Text(note.text),
              subtitle: Text(
                '${note.authorName} · ${fmt.relative(note.createdAt)}',
              ),
            ),
          ),
      ],
    );
  }
}
