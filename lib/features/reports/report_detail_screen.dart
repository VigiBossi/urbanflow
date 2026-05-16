import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../core/models/report_model.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/providers/reports_provider.dart';
import '../../shared/widgets/status_badge.dart';

class ReportDetailScreen extends StatefulWidget {
  final Report report;
  const ReportDetailScreen({super.key, required this.report});

  @override
  State<ReportDetailScreen> createState() => _ReportDetailScreenState();
}

class _ReportDetailScreenState extends State<ReportDetailScreen> {
  final _commentCtrl = TextEditingController();
  bool _submittingComment = false;

  @override
  void dispose() {
    _commentCtrl.dispose();
    super.dispose();
  }

  Report get _current {
    return context.read<ReportsProvider>().getById(widget.report.id) ??
        widget.report;
  }

  Future<void> _submitComment() async {
    final text = _commentCtrl.text.trim();
    if (text.isEmpty) return;
    final auth = context.read<AuthProvider>();
    if (auth.user == null) return;
    setState(() => _submittingComment = true);
    await Future.delayed(const Duration(milliseconds: 400));
    context.read<ReportsProvider>().addComment(
          reportId: widget.report.id,
          userId: auth.user!.id,
          userName: auth.user!.name,
          text: text,
          isMunicipality: auth.isMunicipality,
          userPhotoUrl: auth.user!.photoUrl,
        );
    _commentCtrl.clear();
    setState(() => _submittingComment = false);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final report = context.select((ReportsProvider p) =>
        p.getById(widget.report.id) ?? widget.report);
    final auth = context.watch<AuthProvider>();
    final hasUpvoted =
        report.upvotedByUserIds.contains(auth.user?.id ?? '');

    return Scaffold(
      appBar: AppBar(
        title: Text(report.categoryLabel),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () {},
          ),
        ],
      ),
      backgroundColor: const Color(0xFFF5F7FF),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeaderCard(report, l10n, auth, hasUpvoted),
                  const SizedBox(height: 14),
                  _buildStatusTimeline(report, l10n),
                  if (report.municipalityNote != null) ...[
                    const SizedBox(height: 14),
                    _buildMunicipalityNote(report, l10n),
                  ],
                  if (report.imageUrls.isNotEmpty) ...[
                    const SizedBox(height: 14),
                    _buildImages(report),
                  ],
                  const SizedBox(height: 14),
                  _buildComments(report, auth, l10n),
                  const SizedBox(height: 80),
                ],
              ),
            ),
          ),
          _buildCommentInput(l10n),
        ],
      ),
    );
  }

  Widget _buildHeaderCard(Report report, AppLocalizations l10n,
      AuthProvider auth, bool hasUpvoted) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: report.statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(report.categoryIcon,
                    color: report.statusColor, size: 26),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(report.title,
                        style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16)),
                    Text(
                      '${report.categoryLabel} • ${timeago.format(report.createdAt)}',
                      style: TextStyle(
                          fontSize: 12, color: Colors.grey[500]),
                    ),
                  ],
                ),
              ),
              StatusBadge.reportStatus(report.status),
            ],
          ),
          const SizedBox(height: 12),
          Text(report.description,
              style: TextStyle(
                  fontSize: 13,
                  color: Colors.grey[700],
                  height: 1.5)),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.location_on_outlined,
                  size: 14, color: Colors.grey),
              const SizedBox(width: 4),
              Expanded(
                child: Text(report.address ?? '',
                    style: TextStyle(
                        fontSize: 12, color: Colors.grey[600]),
                    overflow: TextOverflow.ellipsis),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Text('Reported by: ',
                  style: TextStyle(
                      fontSize: 12, color: Colors.grey[500])),
              Text(report.userName,
                  style: const TextStyle(
                      fontSize: 12, fontWeight: FontWeight.w600)),
              const Spacer(),
              GestureDetector(
                onTap: () => context
                    .read<ReportsProvider>()
                    .upvoteReport(
                        report.id, auth.user?.id ?? ''),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: hasUpvoted
                        ? AppColors.primary.withOpacity(0.1)
                        : Colors.grey[100],
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: hasUpvoted
                          ? AppColors.primary
                          : Colors.grey[300]!,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        hasUpvoted
                            ? Icons.thumb_up
                            : Icons.thumb_up_outlined,
                        size: 14,
                        color: hasUpvoted
                            ? AppColors.primary
                            : Colors.grey,
                      ),
                      const SizedBox(width: 6),
                      Text('${report.upvotes} ${l10n.upvote}',
                          style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: hasUpvoted
                                  ? AppColors.primary
                                  : Colors.grey[600])),
                    ],
                  ),
                ),
              ),
            ],
          ),
          if (report.isHighPriority) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.error.withOpacity(0.08),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                    color: AppColors.error.withOpacity(0.3)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.priority_high,
                      color: AppColors.error, size: 14),
                  const SizedBox(width: 6),
                  Text(
                    'High Priority — AI Score: ${report.priorityScore}',
                    style: const TextStyle(
                        color: AppColors.error,
                        fontSize: 11,
                        fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatusTimeline(Report report, AppLocalizations l10n) {
    final steps = [
      (l10n.pending, ReportStatus.pending, Icons.schedule),
      (l10n.inProgress, ReportStatus.inProgress, Icons.autorenew),
      (l10n.resolved, ReportStatus.resolved, Icons.check_circle),
    ];

    final currentIdx = steps.indexWhere((s) => s.$2 == report.status);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Status Timeline',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 14),
          Row(
            children: steps.asMap().entries.map((entry) {
              final i = entry.key;
              final step = entry.value;
              final isActive = i <= currentIdx;
              final isCurrentStep = i == currentIdx;
              final isRejected = report.status == ReportStatus.rejected;

              return Expanded(
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        children: [
                          Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              color: isRejected && isCurrentStep
                                  ? Colors.grey
                                  : isActive
                                      ? AppColors.primary
                                      : Colors.grey[200],
                              shape: BoxShape.circle,
                            ),
                            child: Icon(step.$3,
                                color: isActive
                                    ? Colors.white
                                    : Colors.grey,
                                size: 18),
                          ),
                          const SizedBox(height: 6),
                          Text(step.$1,
                              style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: isCurrentStep
                                      ? FontWeight.bold
                                      : FontWeight.normal,
                                  color: isActive
                                      ? AppColors.primary
                                      : Colors.grey),
                              textAlign: TextAlign.center),
                        ],
                      ),
                    ),
                    if (i < steps.length - 1)
                      Expanded(
                        child: Container(
                          height: 2,
                          margin: const EdgeInsets.only(bottom: 24),
                          color: i < currentIdx
                              ? AppColors.primary
                              : Colors.grey[200],
                        ),
                      ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildMunicipalityNote(Report report, AppLocalizations l10n) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1565C0).withOpacity(0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color: const Color(0xFF1565C0).withOpacity(0.25)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.account_balance,
              color: AppColors.primary, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(l10n.municipalityNote,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                        fontSize: 12)),
                const SizedBox(height: 4),
                Text(report.municipalityNote!,
                    style: const TextStyle(
                        fontSize: 13, height: 1.4)),
                if (report.assignedTo != null) ...[
                  const SizedBox(height: 6),
                  Text('Assigned to: ${report.assignedTo}',
                      style: TextStyle(
                          fontSize: 11, color: Colors.grey[600])),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImages(Report report) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Photos',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: report.imageUrls.map((url) {
                return Container(
                  width: 100,
                  height: 100,
                  margin: const EdgeInsets.only(right: 10),
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.image_outlined,
                      color: Colors.grey, size: 40),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildComments(
      Report report, AuthProvider auth, AppLocalizations l10n) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${l10n.comments} (${report.comments.length})',
            style: const TextStyle(
                fontWeight: FontWeight.bold, fontSize: 14),
          ),
          if (report.comments.isEmpty) ...[
            const SizedBox(height: 20),
            Center(
              child: Text(
                'No comments yet. Be the first to comment!',
                style: TextStyle(
                    fontSize: 13, color: Colors.grey[500]),
              ),
            ),
            const SizedBox(height: 10),
          ],
          ...report.comments.map((comment) => _CommentTile(comment: comment)),
        ],
      ),
    );
  }

  Widget _buildCommentInput(AppLocalizations l10n) {
    return Container(
      padding: EdgeInsets.fromLTRB(
          16, 10, 16, MediaQuery.of(context).viewInsets.bottom + 12),
      color: Colors.white,
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _commentCtrl,
              decoration: InputDecoration(
                hintText: l10n.addComment,
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 12),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide:
                        BorderSide(color: Colors.grey[300]!)),
                enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide:
                        BorderSide(color: Colors.grey[300]!)),
                focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: const BorderSide(
                        color: AppColors.primary)),
                filled: true,
                fillColor: Colors.grey[50],
              ),
            ),
          ),
          const SizedBox(width: 10),
          GestureDetector(
            onTap: _submittingComment ? null : _submitComment,
            child: Container(
              width: 44,
              height: 44,
              decoration: const BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
              ),
              child: _submittingComment
                  ? const Padding(
                      padding: EdgeInsets.all(12),
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2),
                    )
                  : const Icon(Icons.send,
                      color: Colors.white, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}

class _CommentTile extends StatelessWidget {
  final ReportComment comment;
  const _CommentTile({required this.comment});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: comment.isMunicipality
                  ? AppColors.primary.withOpacity(0.1)
                  : Colors.grey[200],
              shape: BoxShape.circle,
            ),
            child: Icon(
              comment.isMunicipality
                  ? Icons.account_balance
                  : Icons.person,
              color: comment.isMunicipality
                  ? AppColors.primary
                  : Colors.grey[500],
              size: 18,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(comment.userName,
                        style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 13)),
                    if (comment.isMunicipality) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text('Official',
                            style: TextStyle(
                                fontSize: 9,
                                color: AppColors.primary,
                                fontWeight: FontWeight.bold)),
                      ),
                    ],
                    const Spacer(),
                    Text(timeago.format(comment.createdAt),
                        style: TextStyle(
                            fontSize: 10,
                            color: Colors.grey[500])),
                  ],
                ),
                const SizedBox(height: 4),
                Text(comment.text,
                    style: TextStyle(
                        fontSize: 13, color: Colors.grey[700])),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
