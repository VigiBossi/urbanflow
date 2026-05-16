enum NotificationType {
  parkingExpiring,
  parkingExpired,
  reportStatusUpdate,
  reportComment,
  reportUpvote,
  trafficAlert,
  aiSuggestion,
  system,
}

class AppNotification {
  final String id;
  final String title;
  final String body;
  final NotificationType type;
  final DateTime createdAt;
  final bool isRead;
  final Map<String, dynamic>? data;

  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.createdAt,
    this.isRead = false,
    this.data,
  });

  String get typeIcon {
    switch (type) {
      case NotificationType.parkingExpiring:
        return '⏰';
      case NotificationType.parkingExpired:
        return '🚗';
      case NotificationType.reportStatusUpdate:
        return '📋';
      case NotificationType.reportComment:
        return '💬';
      case NotificationType.reportUpvote:
        return '👍';
      case NotificationType.trafficAlert:
        return '🚦';
      case NotificationType.aiSuggestion:
        return '🤖';
      case NotificationType.system:
        return '🔔';
    }
  }

  AppNotification copyWith({bool? isRead}) => AppNotification(
        id: id,
        title: title,
        body: body,
        type: type,
        createdAt: createdAt,
        isRead: isRead ?? this.isRead,
        data: data,
      );
}
