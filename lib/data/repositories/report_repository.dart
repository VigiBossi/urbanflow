import '../models/city_report.dart';
import '../models/staff_member.dart';

class ReportNotFoundException implements Exception {
  const ReportNotFoundException(this.id);

  final String id;

  @override
  String toString() => 'ReportNotFoundException($id)';
}

/// City reports backend contract.
abstract interface class ReportRepository {
  /// All reports, or only those created by [reporterId].
  Future<List<CityReport>> fetchReports({String? reporterId});

  Future<CityReport> fetchReport(String id);

  Future<CityReport> createReport(String reporterId, ReportDraft draft);

  /// Throws [InvalidStatusTransition] for disallowed changes.
  Future<CityReport> updateStatus(String id, ReportStatus status);

  Future<CityReport> updatePriority(String id, ReportPriority priority);

  /// Assigns to a staff member, or unassigns when [staffId] is null.
  Future<CityReport> assign(String id, String? staffId);

  Future<CityReport> addNote(String id, String authorName, String text);

  Future<List<StaffMember>> fetchStaff();
}
