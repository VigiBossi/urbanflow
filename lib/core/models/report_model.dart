import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

enum ReportCategory {
  traffic,
  pothole,
  streetLight,
  accident,
  waste,
  illegalDumping,
  flooding,
  noisePollution,
  vandalism,
  other,
}

enum ReportStatus { pending, inProgress, resolved, rejected }

class ReportComment {
  final String id;
  final String userId;
  final String userName;
  final String? userPhotoUrl;
  final String text;
  final DateTime createdAt;
  final bool isMunicipality;

  const ReportComment({
    required this.id,
    required this.userId,
    required this.userName,
    this.userPhotoUrl,
    required this.text,
    required this.createdAt,
    this.isMunicipality = false,
  });

  factory ReportComment.fromJson(Map<String, dynamic> json) => ReportComment(
        id: json['id'] as String,
        userId: json['userId'] as String,
        userName: json['userName'] as String,
        userPhotoUrl: json['userPhotoUrl'] as String?,
        text: json['text'] as String,
        createdAt: DateTime.parse(json['createdAt'] as String),
        isMunicipality: json['isMunicipality'] as bool? ?? false,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'userId': userId,
        'userName': userName,
        'userPhotoUrl': userPhotoUrl,
        'text': text,
        'createdAt': createdAt.toIso8601String(),
        'isMunicipality': isMunicipality,
      };
}

class Report {
  final String id;
  final String title;
  final String description;
  final ReportCategory category;
  final ReportStatus status;
  final double lat;
  final double lng;
  final String? address;
  final String userId;
  final String userName;
  final String? userPhotoUrl;
  final List<String> imageUrls;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final int upvotes;
  final List<String> upvotedByUserIds;
  final List<ReportComment> comments;
  final String? assignedTo;
  final int priorityScore;
  final String? municipalityNote;

  const Report({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.status,
    required this.lat,
    required this.lng,
    this.address,
    required this.userId,
    required this.userName,
    this.userPhotoUrl,
    this.imageUrls = const [],
    required this.createdAt,
    this.updatedAt,
    this.upvotes = 0,
    this.upvotedByUserIds = const [],
    this.comments = const [],
    this.assignedTo,
    this.priorityScore = 0,
    this.municipalityNote,
  });

  IconData get categoryIcon {
    switch (category) {
      case ReportCategory.traffic:
        return Icons.traffic;
      case ReportCategory.pothole:
        return Icons.warning_amber_rounded;
      case ReportCategory.streetLight:
        return Icons.lightbulb_outline;
      case ReportCategory.accident:
        return Icons.car_crash;
      case ReportCategory.waste:
        return Icons.delete_outline;
      case ReportCategory.illegalDumping:
        return Icons.delete_forever;
      case ReportCategory.flooding:
        return Icons.water;
      case ReportCategory.noisePollution:
        return Icons.volume_up;
      case ReportCategory.vandalism:
        return Icons.construction;
      case ReportCategory.other:
        return Icons.report_problem_outlined;
    }
  }

  String get categoryLabel {
    switch (category) {
      case ReportCategory.traffic:
        return 'Traffic';
      case ReportCategory.pothole:
        return 'Pothole';
      case ReportCategory.streetLight:
        return 'Street Light';
      case ReportCategory.accident:
        return 'Accident';
      case ReportCategory.waste:
        return 'Waste';
      case ReportCategory.illegalDumping:
        return 'Illegal Dumping';
      case ReportCategory.flooding:
        return 'Flooding';
      case ReportCategory.noisePollution:
        return 'Noise';
      case ReportCategory.vandalism:
        return 'Vandalism';
      case ReportCategory.other:
        return 'Other';
    }
  }

  Color get statusColor {
    switch (status) {
      case ReportStatus.pending:
        return AppColors.reportPending;
      case ReportStatus.inProgress:
        return AppColors.reportInProgress;
      case ReportStatus.resolved:
        return AppColors.reportResolved;
      case ReportStatus.rejected:
        return Colors.grey;
    }
  }

  String get statusLabel {
    switch (status) {
      case ReportStatus.pending:
        return 'Pending';
      case ReportStatus.inProgress:
        return 'In Progress';
      case ReportStatus.resolved:
        return 'Resolved';
      case ReportStatus.rejected:
        return 'Rejected';
    }
  }

  String get statusEmoji {
    switch (status) {
      case ReportStatus.pending:
        return '🔴';
      case ReportStatus.inProgress:
        return '🟡';
      case ReportStatus.resolved:
        return '🟢';
      case ReportStatus.rejected:
        return '⚫';
    }
  }

  bool get isHighPriority => priorityScore >= 70;

  Report copyWith({
    ReportStatus? status,
    int? upvotes,
    List<String>? upvotedByUserIds,
    List<ReportComment>? comments,
    String? assignedTo,
    int? priorityScore,
    String? municipalityNote,
    DateTime? updatedAt,
  }) =>
      Report(
        id: id,
        title: title,
        description: description,
        category: category,
        status: status ?? this.status,
        lat: lat,
        lng: lng,
        address: address,
        userId: userId,
        userName: userName,
        userPhotoUrl: userPhotoUrl,
        imageUrls: imageUrls,
        createdAt: createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        upvotes: upvotes ?? this.upvotes,
        upvotedByUserIds: upvotedByUserIds ?? this.upvotedByUserIds,
        comments: comments ?? this.comments,
        assignedTo: assignedTo ?? this.assignedTo,
        priorityScore: priorityScore ?? this.priorityScore,
        municipalityNote: municipalityNote ?? this.municipalityNote,
      );
}
