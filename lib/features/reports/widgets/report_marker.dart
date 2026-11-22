import 'package:material_ui/material_ui.dart';

import '../../../core/utils/enum_labels.dart';
import '../../../data/models/city_report.dart';

/// Map marker with the category icon.
class ReportMarker extends StatelessWidget {
  const ReportMarker({super.key, required this.category, this.status});

  final ReportCategory category;
  final ReportStatus? status;

  @override
  Widget build(BuildContext context) {
    final resolved = status == ReportStatus.resolved;
    return Container(
      decoration: BoxDecoration(
        color: resolved ? Colors.grey : category.color,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 2),
        boxShadow: const [
          BoxShadow(blurRadius: 4, color: Colors.black26, offset: Offset(0, 2)),
        ],
      ),
      child: Icon(category.icon, color: Colors.white, size: 20),
    );
  }
}
