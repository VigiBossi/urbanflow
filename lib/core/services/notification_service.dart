import '../models/notification_model.dart';
import '../models/payment_model.dart';
import '../models/report_model.dart';
import 'package:uuid/uuid.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._();
  factory NotificationService() => _instance;
  NotificationService._();

  final _uuid = const Uuid();
  final List<AppNotification> _notifications = [];

  List<AppNotification> get all =>
      List.unmodifiable(_notifications.reversed.toList());

  List<AppNotification> get unread =>
      _notifications.where((n) => !n.isRead).toList();

  int get unreadCount => unread.length;

  void _add(AppNotification n) {
    _notifications.add(n);
  }

  void addParkingExpiryNotification(ParkingSession session) {
    final mins = session.remaining.inMinutes;
    _add(AppNotification(
      id: _uuid.v4(),
      title: 'Parking Expiring Soon',
      body: 'Your parking at ${session.parkingSpotName} expires in ${mins}m. Tap to extend.',
      type: NotificationType.parkingExpiring,
      createdAt: DateTime.now(),
      data: {'sessionId': session.id},
    ));
  }

  void addParkingExpiredNotification(ParkingSession session) {
    _add(AppNotification(
      id: _uuid.v4(),
      title: 'Parking Session Ended',
      body: 'Your parking at ${session.parkingSpotName} has ended.',
      type: NotificationType.parkingExpired,
      createdAt: DateTime.now(),
      data: {'sessionId': session.id},
    ));
  }

  void addReportStatusNotification(Report report) {
    _add(AppNotification(
      id: _uuid.v4(),
      title: 'Report Updated',
      body: '"${report.title}" is now ${report.statusLabel}. ${report.municipalityNote ?? ''}',
      type: NotificationType.reportStatusUpdate,
      createdAt: DateTime.now(),
      data: {'reportId': report.id},
    ));
  }

  void addCommentNotification(Report report, String commenterName) {
    _add(AppNotification(
      id: _uuid.v4(),
      title: 'New Comment',
      body: '$commenterName commented on "${report.title}".',
      type: NotificationType.reportComment,
      createdAt: DateTime.now(),
      data: {'reportId': report.id},
    ));
  }

  void addTrafficAlert(String message) {
    _add(AppNotification(
      id: _uuid.v4(),
      title: 'Traffic Alert',
      body: message,
      type: NotificationType.trafficAlert,
      createdAt: DateTime.now(),
    ));
  }

  void addWelcomeNotification(String userName) {
    _add(AppNotification(
      id: _uuid.v4(),
      title: 'Welcome to UrbanFlow AI!',
      body: 'Hi $userName! Your smart city companion is ready. Find parking, report issues, and stay informed.',
      type: NotificationType.system,
      createdAt: DateTime.now(),
    ));
  }

  void markAsRead(String id) {
    final idx = _notifications.indexWhere((n) => n.id == id);
    if (idx != -1) {
      _notifications[idx] = _notifications[idx].copyWith(isRead: true);
    }
  }

  void markAllAsRead() {
    for (var i = 0; i < _notifications.length; i++) {
      _notifications[i] = _notifications[i].copyWith(isRead: true);
    }
  }

  void clear() => _notifications.clear();
}
