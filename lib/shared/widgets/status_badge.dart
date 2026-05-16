import 'package:flutter/material.dart';
import '../../core/models/report_model.dart';
import '../../core/models/parking_spot_model.dart';

class StatusBadge extends StatelessWidget {
  final String label;
  final Color color;
  final IconData? icon;
  final bool small;

  const StatusBadge({
    super.key,
    required this.label,
    required this.color,
    this.icon,
    this.small = false,
  });

  factory StatusBadge.reportStatus(ReportStatus status) {
    return StatusBadge(
      label: status.name == 'inProgress' ? 'In Progress' : 
             '${status.name[0].toUpperCase()}${status.name.substring(1)}',
      color: _reportColor(status),
      icon: _reportIcon(status),
    );
  }

  factory StatusBadge.parkingStatus(ParkingStatus status) {
    return StatusBadge(
      label: '${status.name[0].toUpperCase()}${status.name.substring(1)}',
      color: _parkingColor(status),
    );
  }

  static Color _reportColor(ReportStatus s) {
    switch (s) {
      case ReportStatus.pending: return const Color(0xFFFFC107);
      case ReportStatus.inProgress: return const Color(0xFF2196F3);
      case ReportStatus.resolved: return const Color(0xFF4CAF50);
      case ReportStatus.rejected: return Colors.grey;
    }
  }

  static IconData _reportIcon(ReportStatus s) {
    switch (s) {
      case ReportStatus.pending: return Icons.schedule;
      case ReportStatus.inProgress: return Icons.autorenew;
      case ReportStatus.resolved: return Icons.check_circle;
      case ReportStatus.rejected: return Icons.cancel;
    }
  }

  static Color _parkingColor(ParkingStatus s) {
    switch (s) {
      case ParkingStatus.available: return const Color(0xFF4CAF50);
      case ParkingStatus.limited: return const Color(0xFFFFC107);
      case ParkingStatus.full: return const Color(0xFFF44336);
      case ParkingStatus.closed: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: small ? 8 : 10,
        vertical: small ? 3 : 5,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, color: color, size: small ? 10 : 13),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: small ? 10 : 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
