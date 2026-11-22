import 'package:latlong2/latlong.dart';

import 'report_status_flow.dart';

enum ReportCategory {
  pothole,
  streetlight,
  graffiti,
  trash,
  damagedSign,
  other,
}

enum ReportStatus { submitted, inReview, inProgress, resolved }

enum ReportPriority { low, medium, high, critical }

/// A note added to a report by municipality staff.
class ReportNote {
  const ReportNote({
    required this.id,
    required this.authorName,
    required this.text,
    required this.createdAt,
  });

  final String id;
  final String authorName;
  final String text;
  final DateTime createdAt;

  factory ReportNote.fromJson(Map<String, dynamic> json) => ReportNote(
    id: json['id'] as String,
    authorName: json['authorName'] as String,
    text: json['text'] as String,
    createdAt: DateTime.parse(json['createdAt'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'authorName': authorName,
    'text': text,
    'createdAt': createdAt.toIso8601String(),
  };
}

/// One entry of a report's status history.
class StatusChange {
  const StatusChange({required this.status, required this.changedAt});

  final ReportStatus status;
  final DateTime changedAt;

  factory StatusChange.fromJson(Map<String, dynamic> json) => StatusChange(
    status: ReportStatus.values.byName(json['status'] as String),
    changedAt: DateTime.parse(json['changedAt'] as String),
  );

  Map<String, dynamic> toJson() => {
    'status': status.name,
    'changedAt': changedAt.toIso8601String(),
  };
}

/// A citizen report about an issue in the city.
class CityReport {
  const CityReport({
    required this.id,
    required this.reporterId,
    required this.category,
    required this.description,
    required this.latitude,
    required this.longitude,
    required this.neighborhood,
    required this.status,
    required this.priority,
    required this.createdAt,
    required this.updatedAt,
    this.hasPhoto = false,
    this.assignedStaffId,
    this.notes = const [],
    this.history = const [],
  });

  final String id;
  final String reporterId;
  final ReportCategory category;
  final String description;
  final double latitude;
  final double longitude;
  final String neighborhood;
  final ReportStatus status;
  final ReportPriority priority;
  final DateTime createdAt;
  final DateTime updatedAt;

  /// Whether the citizen attached a photo (placeholder in the mock backend).
  final bool hasPhoto;
  final String? assignedStaffId;
  final List<ReportNote> notes;
  final List<StatusChange> history;

  LatLng get position => LatLng(latitude, longitude);

  bool get isOpen => status != ReportStatus.resolved;

  /// When the report was resolved, or null when still open.
  DateTime? get resolvedAt {
    if (status != ReportStatus.resolved) return null;
    for (final change in history.reversed) {
      if (change.status == ReportStatus.resolved) return change.changedAt;
    }
    return updatedAt;
  }

  /// Returns a copy moved to [next], recording the change in [history].
  ///
  /// Throws [InvalidStatusTransition] when the move is not allowed by
  /// [ReportStatusFlow].
  CityReport transitionTo(ReportStatus next, DateTime at) {
    ReportStatusFlow.ensureCanTransition(status, next);
    return copyWith(
      status: next,
      updatedAt: at,
      history: [
        ...history,
        StatusChange(status: next, changedAt: at),
      ],
    );
  }

  CityReport copyWith({
    ReportStatus? status,
    ReportPriority? priority,
    DateTime? updatedAt,
    String? assignedStaffId,
    bool clearAssignee = false,
    List<ReportNote>? notes,
    List<StatusChange>? history,
  }) => CityReport(
    id: id,
    reporterId: reporterId,
    category: category,
    description: description,
    latitude: latitude,
    longitude: longitude,
    neighborhood: neighborhood,
    status: status ?? this.status,
    priority: priority ?? this.priority,
    createdAt: createdAt,
    updatedAt: updatedAt ?? this.updatedAt,
    hasPhoto: hasPhoto,
    assignedStaffId: clearAssignee
        ? null
        : (assignedStaffId ?? this.assignedStaffId),
    notes: notes ?? this.notes,
    history: history ?? this.history,
  );

  factory CityReport.fromJson(Map<String, dynamic> json) => CityReport(
    id: json['id'] as String,
    reporterId: json['reporterId'] as String,
    category: ReportCategory.values.byName(json['category'] as String),
    description: json['description'] as String,
    latitude: (json['latitude'] as num).toDouble(),
    longitude: (json['longitude'] as num).toDouble(),
    neighborhood: json['neighborhood'] as String,
    status: ReportStatus.values.byName(json['status'] as String),
    priority: ReportPriority.values.byName(json['priority'] as String),
    createdAt: DateTime.parse(json['createdAt'] as String),
    updatedAt: DateTime.parse(json['updatedAt'] as String),
    hasPhoto: json['hasPhoto'] as bool? ?? false,
    assignedStaffId: json['assignedStaffId'] as String?,
    notes: (json['notes'] as List<dynamic>? ?? const [])
        .map((e) => ReportNote.fromJson(e as Map<String, dynamic>))
        .toList(),
    history: (json['history'] as List<dynamic>? ?? const [])
        .map((e) => StatusChange.fromJson(e as Map<String, dynamic>))
        .toList(),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'reporterId': reporterId,
    'category': category.name,
    'description': description,
    'latitude': latitude,
    'longitude': longitude,
    'neighborhood': neighborhood,
    'status': status.name,
    'priority': priority.name,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
    'hasPhoto': hasPhoto,
    'assignedStaffId': assignedStaffId,
    'notes': notes.map((n) => n.toJson()).toList(),
    'history': history.map((h) => h.toJson()).toList(),
  };
}

/// Data needed to create a new report.
class ReportDraft {
  const ReportDraft({
    required this.category,
    required this.description,
    required this.latitude,
    required this.longitude,
    this.hasPhoto = false,
  });

  final ReportCategory category;
  final String description;
  final double latitude;
  final double longitude;
  final bool hasPhoto;
}
