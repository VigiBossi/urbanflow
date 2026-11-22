import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:urbanflow_ai/data/models/city_report.dart';
import 'package:urbanflow_ai/data/models/report_status_flow.dart';
import 'package:urbanflow_ai/data/repositories/mock/mock_report_repository.dart';
import 'package:urbanflow_ai/data/services/local_store.dart';

CityReport _report(ReportStatus status) {
  final created = DateTime(2026, 3, 1, 9);
  return CityReport(
    id: 'r1',
    reporterId: 'u1',
    category: ReportCategory.pothole,
    description: 'Deep pothole on the boulevard',
    latitude: 41.9855,
    longitude: 21.4625,
    neighborhood: 'Aerodrom',
    status: status,
    priority: ReportPriority.medium,
    createdAt: created,
    updatedAt: created,
    history: [StatusChange(status: status, changedAt: created)],
  );
}

void main() {
  group('ReportStatusFlow', () {
    test('happy path Submitted -> In Review -> In Progress -> Resolved', () {
      expect(
        ReportStatusFlow.canTransition(
          ReportStatus.submitted,
          ReportStatus.inReview,
        ),
        isTrue,
      );
      expect(
        ReportStatusFlow.canTransition(
          ReportStatus.inReview,
          ReportStatus.inProgress,
        ),
        isTrue,
      );
      expect(
        ReportStatusFlow.canTransition(
          ReportStatus.inProgress,
          ReportStatus.resolved,
        ),
        isTrue,
      );
    });

    test('cannot skip review or go back to submitted', () {
      expect(
        ReportStatusFlow.canTransition(
          ReportStatus.submitted,
          ReportStatus.resolved,
        ),
        isFalse,
      );
      expect(
        ReportStatusFlow.canTransition(
          ReportStatus.submitted,
          ReportStatus.inProgress,
        ),
        isFalse,
      );
      for (final s in ReportStatus.values) {
        expect(
          ReportStatusFlow.canTransition(s, ReportStatus.submitted),
          isFalse,
        );
      }
    });

    test('no self transitions', () {
      for (final s in ReportStatus.values) {
        expect(ReportStatusFlow.canTransition(s, s), isFalse);
      }
    });

    test('resolved reports can be reopened to in progress', () {
      expect(ReportStatusFlow.nextStatuses(ReportStatus.resolved), [
        ReportStatus.inProgress,
      ]);
    });

    test('next statuses are returned in lifecycle order', () {
      expect(ReportStatusFlow.nextStatuses(ReportStatus.inReview), [
        ReportStatus.inProgress,
        ReportStatus.resolved,
      ]);
    });
  });

  group('CityReport.transitionTo', () {
    test('records history and resolvedAt', () {
      final t1 = DateTime(2026, 3, 1, 12);
      final t2 = DateTime(2026, 3, 2, 12);
      final t3 = DateTime(2026, 3, 3, 12);
      final resolved = _report(ReportStatus.submitted)
          .transitionTo(ReportStatus.inReview, t1)
          .transitionTo(ReportStatus.inProgress, t2)
          .transitionTo(ReportStatus.resolved, t3);
      expect(resolved.status, ReportStatus.resolved);
      expect(resolved.history.map((h) => h.status), ReportStatus.values);
      expect(resolved.resolvedAt, t3);
      expect(resolved.updatedAt, t3);
      expect(resolved.isOpen, isFalse);
    });

    test('throws on invalid transition', () {
      expect(
        () =>
            _report(ReportStatus.submitted)
                .transitionTo(ReportStatus.resolved, DateTime(2026)),
        throwsA(isA<InvalidStatusTransition>()),
      );
    });

    test('JSON round trip keeps status and history', () {
      final report = _report(ReportStatus.submitted)
          .transitionTo(ReportStatus.inReview, DateTime(2026, 3, 2));
      final copy = CityReport.fromJson(report.toJson());
      expect(copy.status, ReportStatus.inReview);
      expect(copy.history.length, 2);
      expect(copy.toJson(), report.toJson());
    });
  });

  group('MockReportRepository status updates', () {
    late MockReportRepository repository;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      repository = MockReportRepository(
        store: LocalStore(await SharedPreferences.getInstance()),
      );
    });

    test('new reports start as submitted and move through the flow', () async {
      final created = await repository.createReport(
        'citizen',
        const ReportDraft(
          category: ReportCategory.streetlight,
          description: 'Light is off at night',
          latitude: 41.9961,
          longitude: 21.4316,
        ),
      );
      expect(created.status, ReportStatus.submitted);
      expect(created.neighborhood, 'Centar');

      final reviewed = await repository.updateStatus(
        created.id,
        ReportStatus.inReview,
      );
      expect(reviewed.status, ReportStatus.inReview);

      await expectLater(
        repository.updateStatus(created.id, ReportStatus.submitted),
        throwsA(isA<InvalidStatusTransition>()),
      );

      final mine = await repository.fetchReports(reporterId: 'citizen');
      expect(mine.single.status, ReportStatus.inReview);
    });
  });
}
