import 'package:latlong2/latlong.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/utils/id_generator.dart';
import '../../mock/mock_network.dart';
import '../../mock/skopje_data.dart';
import '../../models/city_report.dart';
import '../../models/staff_member.dart';
import '../../services/local_store.dart';
import '../report_repository.dart';

/// Simulated reports backend persisted to [LocalStore]. Seeds realistic
/// Skopje data on first launch.
class MockReportRepository implements ReportRepository {
  MockReportRepository({
    required this.store,
    this.network = MockNetwork.instant,
    DateTime Function()? clock,
  }) : _clock = clock ?? DateTime.now;

  final LocalStore store;
  final MockNetwork network;
  final DateTime Function() _clock;
  List<CityReport>? _cache;

  List<CityReport> _all() {
    if (_cache != null) return _cache!;
    final stored = store.getJsonList(StorageKeys.reports);
    if (stored.isNotEmpty) {
      _cache = stored.map(CityReport.fromJson).toList();
    } else {
      _cache = SkopjeData.seedReports(_clock());
      _persist();
    }
    return _cache!;
  }

  Future<void> _persist() => store.setJsonList(
    StorageKeys.reports,
    _cache!.map((r) => r.toJson()).toList(),
  );

  CityReport _find(String id) => _all().firstWhere(
    (r) => r.id == id,
    orElse: () => throw ReportNotFoundException(id),
  );

  Future<CityReport> _replace(
    String id,
    CityReport Function(CityReport) change,
  ) async {
    final updated = await network.run(() => change(_find(id)));
    final list = _all();
    list[list.indexWhere((r) => r.id == id)] = updated;
    await _persist();
    return updated;
  }

  @override
  Future<List<CityReport>> fetchReports({String? reporterId}) =>
      network.run(() {
        final list = _all()
            .where((r) => reporterId == null || r.reporterId == reporterId)
            .toList();
        list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        return list;
      });

  @override
  Future<CityReport> fetchReport(String id) => network.run(() => _find(id));

  @override
  Future<CityReport> createReport(String reporterId, ReportDraft draft) async {
    final report = await network.run(() {
      final now = _clock();
      return CityReport(
        id: IdGenerator.next('r'),
        reporterId: reporterId,
        category: draft.category,
        description: draft.description.trim(),
        latitude: draft.latitude,
        longitude: draft.longitude,
        neighborhood: SkopjeData.neighborhoodFor(
          LatLng(draft.latitude, draft.longitude),
        ),
        status: ReportStatus.submitted,
        priority: ReportPriority.medium,
        createdAt: now,
        updatedAt: now,
        hasPhoto: draft.hasPhoto,
        history: [StatusChange(status: ReportStatus.submitted, changedAt: now)],
      );
    });
    _all().insert(0, report);
    await _persist();
    return report;
  }

  @override
  Future<CityReport> updateStatus(String id, ReportStatus status) =>
      _replace(id, (r) => r.transitionTo(status, _clock()));

  @override
  Future<CityReport> updatePriority(String id, ReportPriority priority) =>
      _replace(id, (r) => r.copyWith(priority: priority, updatedAt: _clock()));

  @override
  Future<CityReport> assign(String id, String? staffId) => _replace(
    id,
    (r) => r.copyWith(
      assignedStaffId: staffId,
      clearAssignee: staffId == null,
      updatedAt: _clock(),
    ),
  );

  @override
  Future<CityReport> addNote(String id, String authorName, String text) =>
      _replace(id, (r) {
        final now = _clock();
        return r.copyWith(
          updatedAt: now,
          notes: [
            ...r.notes,
            ReportNote(
              id: IdGenerator.next('n'),
              authorName: authorName,
              text: text.trim(),
              createdAt: now,
            ),
          ],
        );
      });

  @override
  Future<List<StaffMember>> fetchStaff() =>
      network.run(() => List.unmodifiable(SkopjeData.staff));
}
