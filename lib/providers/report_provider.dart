import 'package:flutter/foundation.dart';

import '../data/models/app_user.dart';
import '../data/models/city_report.dart';
import '../data/models/staff_member.dart';
import '../data/repositories/report_repository.dart';
import 'view_status.dart';

enum ReportSort { newest, priority }

/// Filters applied to the municipality report list.
@immutable
class ReportFilter {
  const ReportFilter({
    this.status,
    this.category,
    this.priority,
    this.neighborhood,
    this.sort = ReportSort.newest,
  });

  final ReportStatus? status;
  final ReportCategory? category;
  final ReportPriority? priority;
  final String? neighborhood;
  final ReportSort sort;

  bool get isEmpty =>
      status == null &&
      category == null &&
      priority == null &&
      neighborhood == null;

  ReportFilter copyWith({
    ReportStatus? Function()? status,
    ReportCategory? Function()? category,
    ReportPriority? Function()? priority,
    String? Function()? neighborhood,
    ReportSort? sort,
  }) => ReportFilter(
    status: status != null ? status() : this.status,
    category: category != null ? category() : this.category,
    priority: priority != null ? priority() : this.priority,
    neighborhood: neighborhood != null ? neighborhood() : this.neighborhood,
    sort: sort ?? this.sort,
  );

  bool matches(CityReport r) =>
      (status == null || r.status == status) &&
      (category == null || r.category == category) &&
      (priority == null || r.priority == priority) &&
      (neighborhood == null || r.neighborhood == neighborhood);
}

/// Reports for citizens (own reports) and municipality staff (all reports).
class ReportProvider extends ChangeNotifier {
  ReportProvider(this._repository);

  final ReportRepository _repository;

  ViewStatus _status = ViewStatus.initial;
  AppUser? _user;
  List<CityReport> _reports = const [];
  List<StaffMember> _staff = const [];
  ReportFilter _filter = const ReportFilter();
  bool _submitting = false;

  ViewStatus get status => _status;
  List<CityReport> get reports => _reports;
  List<StaffMember> get staff => _staff;
  ReportFilter get filter => _filter;
  bool get isSubmitting => _submitting;

  StaffMember? staffById(String? id) {
    if (id == null) return null;
    for (final s in _staff) {
      if (s.id == id) return s;
    }
    return null;
  }

  CityReport? byId(String id) {
    for (final r in _reports) {
      if (r.id == id) return r;
    }
    return null;
  }

  /// Reports after applying [filter] and sorting.
  List<CityReport> get filteredReports {
    final list = _reports.where(_filter.matches).toList();
    switch (_filter.sort) {
      case ReportSort.newest:
        list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      case ReportSort.priority:
        list.sort((a, b) {
          final byPriority = b.priority.index.compareTo(a.priority.index);
          return byPriority != 0
              ? byPriority
              : b.createdAt.compareTo(a.createdAt);
        });
    }
    return list;
  }

  List<String> get neighborhoods =>
      (_reports.map((r) => r.neighborhood).toSet().toList()..sort());

  /// Loads reports visible to [user].
  Future<void> load(AppUser user) async {
    _user = user;
    _status = ViewStatus.loading;
    notifyListeners();
    try {
      final results = await Future.wait([
        _repository.fetchReports(
          reporterId: user.isMunicipality ? null : user.id,
        ),
        if (user.isMunicipality) _repository.fetchStaff(),
      ]);
      _reports = results[0].cast<CityReport>();
      if (user.isMunicipality) _staff = results[1].cast<StaffMember>();
      _status = ViewStatus.ready;
    } on Exception {
      _status = ViewStatus.error;
    }
    notifyListeners();
  }

  Future<void> refresh() async {
    final user = _user;
    if (user != null) await load(user);
  }

  void reset() {
    _user = null;
    _reports = const [];
    _staff = const [];
    _filter = const ReportFilter();
    _status = ViewStatus.initial;
  }

  void setFilter(ReportFilter filter) {
    _filter = filter;
    notifyListeners();
  }

  Future<CityReport> submit(ReportDraft draft) async {
    final user = _user;
    if (user == null) throw StateError('Not signed in');
    _submitting = true;
    notifyListeners();
    try {
      final report = await _repository.createReport(user.id, draft);
      _reports = [report, ..._reports];
      return report;
    } finally {
      _submitting = false;
      notifyListeners();
    }
  }

  void _replace(CityReport updated) {
    _reports = [for (final r in _reports) r.id == updated.id ? updated : r];
    notifyListeners();
  }

  Future<CityReport> changeStatus(String id, ReportStatus status) async {
    final updated = await _repository.updateStatus(id, status);
    _replace(updated);
    return updated;
  }

  Future<CityReport> changePriority(String id, ReportPriority priority) async {
    final updated = await _repository.updatePriority(id, priority);
    _replace(updated);
    return updated;
  }

  Future<CityReport> assign(String id, String? staffId) async {
    final updated = await _repository.assign(id, staffId);
    _replace(updated);
    return updated;
  }

  Future<CityReport> addNote(String id, String text) async {
    final updated = await _repository.addNote(id, _user?.name ?? '', text);
    _replace(updated);
    return updated;
  }
}
