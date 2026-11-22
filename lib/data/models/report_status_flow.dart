import 'city_report.dart';

/// Thrown when a report status change is not permitted.
class InvalidStatusTransition implements Exception {
  const InvalidStatusTransition(this.from, this.to);

  final ReportStatus from;
  final ReportStatus to;

  @override
  String toString() => 'InvalidStatusTransition(${from.name} -> ${to.name})';
}

/// The report lifecycle:
///
/// ```text
/// Submitted -> In Review -> In Progress -> Resolved
///                  ^             |            |
///                  +-------------+            |   (send back for review)
///                                ^------------+   (reopen)
/// ```
///
/// Reports may be resolved directly from review (e.g. duplicates), sent back
/// to review from progress, and reopened from resolved. They can never return
/// to Submitted.
abstract final class ReportStatusFlow {
  static const Map<ReportStatus, Set<ReportStatus>> _transitions = {
    ReportStatus.submitted: {ReportStatus.inReview},
    ReportStatus.inReview: {ReportStatus.inProgress, ReportStatus.resolved},
    ReportStatus.inProgress: {ReportStatus.resolved, ReportStatus.inReview},
    ReportStatus.resolved: {ReportStatus.inProgress},
  };

  /// Statuses reachable from [from], in lifecycle order.
  static List<ReportStatus> nextStatuses(ReportStatus from) =>
      ReportStatus.values.where(_transitions[from]!.contains).toList();

  static bool canTransition(ReportStatus from, ReportStatus to) =>
      _transitions[from]!.contains(to);

  static void ensureCanTransition(ReportStatus from, ReportStatus to) {
    if (!canTransition(from, to)) throw InvalidStatusTransition(from, to);
  }

  /// Position of [status] in the happy path (0..3), used for timelines.
  static int stepIndex(ReportStatus status) => status.index;
}
