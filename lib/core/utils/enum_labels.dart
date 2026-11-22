import 'package:material_ui/material_ui.dart';

import '../../data/models/chat_message.dart';
import '../../data/models/city_report.dart';
import '../../data/models/insight.dart';
import '../../data/models/parking_spot.dart';
import '../../data/models/staff_member.dart';
import '../../l10n/generated/app_localizations.dart';
import '../theme/app_colors.dart';

/// Localized labels, icons and colors for domain enums.
extension ReportCategoryUi on ReportCategory {
  String label(AppLocalizations l10n) => switch (this) {
    ReportCategory.pothole => l10n.categoryPothole,
    ReportCategory.streetlight => l10n.categoryStreetlight,
    ReportCategory.graffiti => l10n.categoryGraffiti,
    ReportCategory.trash => l10n.categoryTrash,
    ReportCategory.damagedSign => l10n.categoryDamagedSign,
    ReportCategory.other => l10n.categoryOther,
  };

  IconData get icon => switch (this) {
    ReportCategory.pothole => Icons.construction,
    ReportCategory.streetlight => Icons.lightbulb_outline,
    ReportCategory.graffiti => Icons.format_paint_outlined,
    ReportCategory.trash => Icons.delete_outline,
    ReportCategory.damagedSign => Icons.signpost_outlined,
    ReportCategory.other => Icons.report_outlined,
  };

  Color get color =>
      AppColors.chartPalette[index % AppColors.chartPalette.length];
}

extension ReportStatusUi on ReportStatus {
  String label(AppLocalizations l10n) => switch (this) {
    ReportStatus.submitted => l10n.statusSubmitted,
    ReportStatus.inReview => l10n.statusInReview,
    ReportStatus.inProgress => l10n.statusInProgress,
    ReportStatus.resolved => l10n.statusResolved,
  };

  IconData get icon => switch (this) {
    ReportStatus.submitted => Icons.outbox_outlined,
    ReportStatus.inReview => Icons.manage_search,
    ReportStatus.inProgress => Icons.engineering_outlined,
    ReportStatus.resolved => Icons.check_circle_outline,
  };

  Color get color => switch (this) {
    ReportStatus.submitted => AppColors.statusSubmitted,
    ReportStatus.inReview => AppColors.statusInReview,
    ReportStatus.inProgress => AppColors.statusInProgress,
    ReportStatus.resolved => AppColors.statusResolved,
  };
}

extension ReportPriorityUi on ReportPriority {
  String label(AppLocalizations l10n) => switch (this) {
    ReportPriority.low => l10n.priorityLow,
    ReportPriority.medium => l10n.priorityMedium,
    ReportPriority.high => l10n.priorityHigh,
    ReportPriority.critical => l10n.priorityCritical,
  };

  Color get color => switch (this) {
    ReportPriority.low => AppColors.priorityLow,
    ReportPriority.medium => AppColors.priorityMedium,
    ReportPriority.high => AppColors.priorityHigh,
    ReportPriority.critical => AppColors.priorityCritical,
  };
}

extension ParkingTypeUi on ParkingType {
  String label(AppLocalizations l10n) => switch (this) {
    ParkingType.street => l10n.parkingTypeStreet,
    ParkingType.garage => l10n.parkingTypeGarage,
    ParkingType.lot => l10n.parkingTypeLot,
  };

  IconData get icon => switch (this) {
    ParkingType.street => Icons.add_road,
    ParkingType.garage => Icons.garage_outlined,
    ParkingType.lot => Icons.local_parking,
  };
}

extension DepartmentUi on Department {
  String label(AppLocalizations l10n) => switch (this) {
    Department.roads => l10n.departmentRoads,
    Department.lighting => l10n.departmentLighting,
    Department.sanitation => l10n.departmentSanitation,
    Department.publicSpaces => l10n.departmentPublicSpaces,
  };
}

extension QuickReplyUi on QuickReply {
  String label(AppLocalizations l10n) => switch (this) {
    QuickReply.findParking => l10n.qrFindParking,
    QuickReply.parkingPrice => l10n.qrParkingPrice,
    QuickReply.traffic => l10n.qrTraffic,
    QuickReply.reportIssue => l10n.qrReportIssue,
    QuickReply.myReports => l10n.qrMyReports,
    QuickReply.cityHours => l10n.qrCityHours,
    QuickReply.emergency => l10n.qrEmergency,
  };
}

extension InsightSeverityUi on InsightSeverity {
  IconData get icon => switch (this) {
    InsightSeverity.info => Icons.lightbulb_outline,
    InsightSeverity.positive => Icons.trending_down,
    InsightSeverity.warning => Icons.trending_up,
    InsightSeverity.critical => Icons.priority_high,
  };

  Color get color => switch (this) {
    InsightSeverity.info => AppColors.priorityLow,
    InsightSeverity.positive => AppColors.availabilityHigh,
    InsightSeverity.warning => AppColors.priorityHigh,
    InsightSeverity.critical => AppColors.priorityCritical,
  };
}
