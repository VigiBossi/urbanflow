import 'package:flutter/material.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../core/models/notification_model.dart';
import '../../core/services/notification_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final notifService = NotificationService();
    final notifications = notifService.all;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.notifications),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          if (notifService.unreadCount > 0)
            TextButton(
              onPressed: () {
                notifService.markAllAsRead();
                setState(() {});
              },
              child: Text(l10n.markAllRead,
                  style: const TextStyle(
                      color: Colors.white70, fontSize: 12)),
            ),
        ],
      ),
      backgroundColor: const Color(0xFFF5F7FF),
      body: notifications.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.notifications_none,
                      size: 72, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  Text(l10n.noNotifications,
                      style: TextStyle(
                          fontSize: 18,
                          color: Colors.grey[500],
                          fontWeight: FontWeight.w500)),
                ],
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 12),
              itemCount: notifications.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (_, i) {
                final n = notifications[i];
                return _NotificationCard(
                  notification: n,
                  onTap: () {
                    notifService.markAsRead(n.id);
                    setState(() {});
                  },
                );
              },
            ),
    );
  }
}

class _NotificationCard extends StatelessWidget {
  final AppNotification notification;
  final VoidCallback onTap;

  const _NotificationCard({
    required this.notification,
    required this.onTap,
  });

  Color get _bgColor {
    if (!notification.isRead) return Colors.white;
    return Colors.grey[50]!;
  }

  Color get _typeColor {
    switch (notification.type) {
      case NotificationType.parkingExpiring:
        return AppColors.warning;
      case NotificationType.parkingExpired:
        return AppColors.error;
      case NotificationType.reportStatusUpdate:
        return AppColors.primary;
      case NotificationType.reportComment:
        return AppColors.secondary;
      case NotificationType.reportUpvote:
        return const Color(0xFF9C27B0);
      case NotificationType.trafficAlert:
        return AppColors.error;
      case NotificationType.aiSuggestion:
        return Colors.amber;
      case NotificationType.system:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: _bgColor,
          borderRadius: BorderRadius.circular(14),
          boxShadow: notification.isRead
              ? null
              : [
                  BoxShadow(
                      color: Colors.black.withOpacity(0.06),
                      blurRadius: 8,
                      offset: const Offset(0, 2)),
                ],
          border: notification.isRead
              ? Border.all(color: Colors.grey[200]!)
              : Border.all(
                  color: _typeColor.withOpacity(0.3),
                  width: 1.5),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: _typeColor.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(notification.typeIcon,
                    style: const TextStyle(fontSize: 20)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(notification.title,
                            style: TextStyle(
                                fontWeight: notification.isRead
                                    ? FontWeight.w500
                                    : FontWeight.bold,
                                fontSize: 13)),
                      ),
                      if (!notification.isRead)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: _typeColor,
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(notification.body,
                      style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                          height: 1.4),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 6),
                  Text(timeago.format(notification.createdAt),
                      style: TextStyle(
                          fontSize: 10, color: Colors.grey[400])),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
