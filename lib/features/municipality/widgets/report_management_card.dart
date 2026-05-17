import 'package:flutter/material.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../../core/constants/app_colors.dart';
import '../../../core/models/report_model.dart';
import '../../../core/services/ai_service.dart';
import '../../../shared/widgets/status_badge.dart';

class ReportManagementCard extends StatelessWidget {
  final Report report;
  final void Function(ReportStatus status) onStatusChange;
  final void Function(String note) onAddNote;
  final VoidCallback onTap;

  const ReportManagementCard({
    super.key,
    required this.report,
    required this.onStatusChange,
    required this.onAddNote,
    required this.onTap,
  });

  int get _priority => AiService.calculateReportPriority(report);

  Color get _priorityColor {
    if (_priority >= 70) return AppColors.error;
    if (_priority >= 40) return AppColors.warning;
    return AppColors.success;
  }

  String get _priorityLabel {
    if (_priority >= 70) return 'CRITICAL';
    if (_priority >= 40) return 'MEDIUM';
    return 'LOW';
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: _priority >= 70
                ? AppColors.error.withOpacity(0.3)
                : Colors.grey[200]!,
            width: _priority >= 70 ? 1.5 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            _CardHeader(
              report: report,
              priority: _priority,
              priorityColor: _priorityColor,
              priorityLabel: _priorityLabel,
            ),
            const Divider(height: 1),
            _CardActions(report: report, onStatusChange: onStatusChange),
          ],
        ),
      ),
    );
  }
}

class _CardHeader extends StatelessWidget {
  final Report report;
  final int priority;
  final Color priorityColor;
  final String priorityLabel;

  const _CardHeader({
    required this.report,
    required this.priority,
    required this.priorityColor,
    required this.priorityLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: report.statusColor.withOpacity(0.12),
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
                            fontWeight: FontWeight.w700, fontSize: 13),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis),
                    Text(report.userName,
                        style: TextStyle(
                            fontSize: 11, color: Colors.grey[600])),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  StatusBadge(status: report.status),
                  const SizedBox(height: 4),
                  _PriorityBadge(
                    label: priorityLabel,
                    score: priority,
                    color: priorityColor,
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            report.description,
            style: TextStyle(fontSize: 12, color: Colors.grey[700], height: 1.4),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              if (report.address != null) ...[
                Icon(Icons.location_on_outlined,
                    size: 12, color: Colors.grey[400]),
                const SizedBox(width: 4),
                Flexible(
                  child: Text(
                    report.address!,
                    style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 10),
              ],
              Icon(Icons.access_time, size: 12, color: Colors.grey[400]),
              const SizedBox(width: 4),
              Text(
                timeago.format(report.createdAt),
                style: TextStyle(fontSize: 11, color: Colors.grey[600]),
              ),
              const SizedBox(width: 10),
              Icon(Icons.thumb_up_outlined, size: 12, color: Colors.grey[400]),
              const SizedBox(width: 4),
              Text('${report.upvotes}',
                  style: TextStyle(fontSize: 11, color: Colors.grey[600])),
            ],
          ),
        ],
      ),
    );
  }
}

class _PriorityBadge extends StatelessWidget {
  final String label;
  final int score;
  final Color color;

  const _PriorityBadge({
    required this.label,
    required this.score,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(5),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.auto_awesome, size: 9, color: color),
          const SizedBox(width: 3),
          Text('$label ($score)',
              style: TextStyle(
                  fontSize: 9,
                  color: color,
                  fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}

class _CardActions extends StatelessWidget {
  final Report report;
  final void Function(ReportStatus status) onStatusChange;

  const _CardActions(
      {required this.report, required this.onStatusChange});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      child: Row(
        children: [
          if (report.status == ReportStatus.pending)
            Expanded(
              child: _ActionButton(
                label: 'Start',
                icon: Icons.play_arrow_rounded,
                color: AppColors.reportInProgress,
                onTap: () => onStatusChange(ReportStatus.inProgress),
              ),
            ),
          if (report.status == ReportStatus.pending)
            const SizedBox(width: 8),
          if (report.status != ReportStatus.resolved)
            Expanded(
              child: _ActionButton(
                label: 'Resolve',
                icon: Icons.check_circle_outline,
                color: AppColors.reportResolved,
                onTap: () => onStatusChange(ReportStatus.resolved),
              ),
            ),
          if (report.status == ReportStatus.resolved) ...[
            const Icon(Icons.check_circle, color: AppColors.success, size: 18),
            const SizedBox(width: 8),
            Text('Resolved',
                style: TextStyle(
                    color: AppColors.success,
                    fontSize: 12,
                    fontWeight: FontWeight.w600)),
          ],
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _ActionButton({
    required this.label,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 15),
            const SizedBox(width: 5),
            Text(label,
                style: TextStyle(
                    color: color,
                    fontSize: 12,
                    fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}
