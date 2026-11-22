import 'package:material_ui/material_ui.dart';

import '../../../core/utils/enum_labels.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../data/models/city_report.dart';

class _Pill extends StatelessWidget {
  const _Pill({required this.color, required this.label, this.icon});

  final Color color;
  final String label;
  final IconData? icon;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(
      color: color.withValues(alpha: 0.14),
      borderRadius: BorderRadius.circular(999),
      border: Border.all(color: color.withValues(alpha: 0.4)),
    ),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (icon != null) ...[
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
        ],
        Text(
          label,
          style: Theme.of(context).textTheme.labelSmall
              ?.copyWith(color: color, fontWeight: FontWeight.w700),
        ),
      ],
    ),
  );
}

class StatusChip extends StatelessWidget {
  const StatusChip({super.key, required this.status});

  final ReportStatus status;

  @override
  Widget build(BuildContext context) => _Pill(
    color: status.color,
    icon: status.icon,
    label: status.label(context.l10n),
  );
}

class PriorityChip extends StatelessWidget {
  const PriorityChip({super.key, required this.priority});

  final ReportPriority priority;

  @override
  Widget build(BuildContext context) => _Pill(
    color: priority.color,
    icon: Icons.flag_outlined,
    label: priority.label(context.l10n),
  );
}

/// Round icon representing a report category.
class CategoryAvatar extends StatelessWidget {
  const CategoryAvatar({super.key, required this.category, this.size = 40});

  final ReportCategory category;
  final double size;

  @override
  Widget build(BuildContext context) => Container(
    width: size,
    height: size,
    decoration: BoxDecoration(
      color: category.color.withValues(alpha: 0.15),
      shape: BoxShape.circle,
    ),
    child: Icon(category.icon, color: category.color, size: size * 0.55),
  );
}
