import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/notification_service.dart';

class UrbanAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final List<Widget>? actions;
  final bool showNotificationBadge;
  final VoidCallback? onNotificationTap;
  final Widget? bottom;
  final bool centerTitle;

  const UrbanAppBar({
    super.key,
    required this.title,
    this.actions,
    this.showNotificationBadge = false,
    this.onNotificationTap,
    this.bottom,
    this.centerTitle = false,
  });

  @override
  Size get preferredSize =>
      Size.fromHeight(kToolbarHeight + (bottom != null ? 48 : 0));

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(title,
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
      centerTitle: centerTitle,
      backgroundColor: AppColors.primary,
      foregroundColor: Colors.white,
      elevation: 0,
      bottom: bottom != null
          ? PreferredSize(
              preferredSize: const Size.fromHeight(48), child: bottom!)
          : null,
      actions: [
        if (showNotificationBadge)
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: onNotificationTap,
                tooltip: 'Notifications',
              ),
              if (NotificationService().unreadCount > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    width: 18,
                    height: 18,
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        NotificationService().unreadCount > 9
                            ? '9+'
                            : '${NotificationService().unreadCount}',
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ...?actions,
      ],
    );
  }
}
