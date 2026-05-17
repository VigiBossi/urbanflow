import 'package:flutter/material.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../../core/constants/app_colors.dart';
import '../../../core/models/report_model.dart';
import '../../../shared/widgets/status_badge.dart';

class ReportCard extends StatelessWidget {
  final Report report;
  final VoidCallback onTap;
  final VoidCallback? onUpvote;
  final bool hasUpvoted;

  const ReportCard({
    super.key,
    required this.report,
    required this.onTap,
    this.onUpvote,
    this.hasUpvoted = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (report.imageUrls.isNotEmpty)
              ClipRRect(
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(16)),
                child: _ReportThumbnail(url: report.imageUrls.first),
              ),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      _CategoryIcon(report: report),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              report.title,
                              style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 14),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (report.address != null) ...[
                              const SizedBox(height: 2),
                              Row(
                                children: [
                                  Icon(Icons.location_on_outlined,
                                      size: 12,
                                      color: Colors.grey[500]),
                                  const SizedBox(width: 3),
                                  Expanded(
                                    child: Text(
                                      report.address!,
                                      style: TextStyle(
                                          fontSize: 11,
                                          color: Colors.grey[600]),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                      StatusBadge(status: report.status),
                    ],
                  ),
                  const SizedBox(height: 10),
                  _Footer(
                    report: report,
                    onUpvote: onUpvote,
                    hasUpvoted: hasUpvoted,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CategoryIcon extends StatelessWidget {
  final Report report;
  const _CategoryIcon({required this.report});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 42,
      height: 42,
      decoration: BoxDecoration(
        color: report.statusColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Icon(report.categoryIcon, color: report.statusColor, size: 22),
    );
  }
}

class _ReportThumbnail extends StatelessWidget {
  final String url;
  const _ReportThumbnail({required this.url});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 140,
      width: double.infinity,
      child: Image.network(
        url,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => Container(
          color: Colors.grey[100],
          child:
              Icon(Icons.image_not_supported, color: Colors.grey[400], size: 40),
        ),
        loadingBuilder: (_, child, progress) {
          if (progress == null) return child;
          return Container(
            color: Colors.grey[100],
            child: const Center(child: CircularProgressIndicator(strokeWidth: 2)),
          );
        },
      ),
    );
  }
}

class _Footer extends StatelessWidget {
  final Report report;
  final VoidCallback? onUpvote;
  final bool hasUpvoted;

  const _Footer({
    required this.report,
    this.onUpvote,
    required this.hasUpvoted,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(Icons.access_time, size: 12, color: Colors.grey[400]),
        const SizedBox(width: 4),
        Text(
          timeago.format(report.createdAt),
          style: TextStyle(fontSize: 11, color: Colors.grey[500]),
        ),
        const SizedBox(width: 12),
        Icon(Icons.comment_outlined, size: 12, color: Colors.grey[400]),
        const SizedBox(width: 4),
        Text(
          '${report.comments.length}',
          style: TextStyle(fontSize: 11, color: Colors.grey[500]),
        ),
        const Spacer(),
        GestureDetector(
          onTap: onUpvote,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding:
                const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: hasUpvoted
                  ? AppColors.primary.withOpacity(0.1)
                  : Colors.grey[100],
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: hasUpvoted
                    ? AppColors.primary.withOpacity(0.4)
                    : Colors.transparent,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  hasUpvoted
                      ? Icons.thumb_up
                      : Icons.thumb_up_outlined,
                  size: 13,
                  color:
                      hasUpvoted ? AppColors.primary : Colors.grey[600],
                ),
                const SizedBox(width: 5),
                Text(
                  '${report.upvotes}',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color:
                        hasUpvoted ? AppColors.primary : Colors.grey[700],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
