import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../models/report_model.dart';
import '../models/user_model.dart';
import '../services/ai_service.dart';
import '../services/location_service.dart';

class ReportsProvider extends ChangeNotifier {
  final List<Report> _reports = [];
  bool _isLoading = false;
  ReportCategory? _filterCategory;
  ReportStatus? _filterStatus;
  String _searchQuery = '';
  final _uuid = const Uuid();

  List<Report> get reports => _filteredReports;
  List<Report> get allReports => List.unmodifiable(_reports);
  bool get isLoading => _isLoading;
  ReportCategory? get filterCategory => _filterCategory;
  ReportStatus? get filterStatus => _filterStatus;

  List<Report> myReports(String userId) =>
      _reports.where((r) => r.userId == userId).toList()
        ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

  List<Report> get priorityReports =>
      _reports.where((r) => r.isHighPriority).toList()
        ..sort((a, b) => b.priorityScore.compareTo(a.priorityScore));

  List<Report> get _filteredReports {
    var result = List<Report>.from(_reports);
    if (_filterCategory != null) {
      result = result.where((r) => r.category == _filterCategory).toList();
    }
    if (_filterStatus != null) {
      result = result.where((r) => r.status == _filterStatus).toList();
    }
    if (_searchQuery.isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      result = result
          .where((r) =>
              r.title.toLowerCase().contains(q) ||
              r.description.toLowerCase().contains(q) ||
              r.categoryLabel.toLowerCase().contains(q))
          .toList();
    }
    result.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return result;
  }

  Map<ReportCategory, int> get categoryBreakdown {
    final map = <ReportCategory, int>{};
    for (final r in _reports) {
      map[r.category] = (map[r.category] ?? 0) + 1;
    }
    return map;
  }

  Map<ReportStatus, int> get statusBreakdown {
    final map = <ReportStatus, int>{};
    for (final r in _reports) {
      map[r.status] = (map[r.status] ?? 0) + 1;
    }
    return map;
  }

  Future<void> loadReports() async {
    _isLoading = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 700));

    if (_reports.isEmpty) {
      _reports.addAll(_generateMockReports());
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<Report> createReport({
    required String title,
    required String description,
    required ReportCategory category,
    required double lat,
    required double lng,
    required UserModel author,
    List<String> imageUrls = const [],
  }) async {
    _isLoading = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 600));

    final address = LocationService.mockAddressFromCoordinates(lat, lng);
    final report = Report(
      id: _uuid.v4(),
      title: title,
      description: description,
      category: category,
      status: ReportStatus.pending,
      lat: lat,
      lng: lng,
      address: address,
      userId: author.id,
      userName: author.name,
      userPhotoUrl: author.photoUrl,
      imageUrls: imageUrls,
      createdAt: DateTime.now(),
      priorityScore: 0,
    );

    // Assign AI priority score
    final scored = report.copyWith(
      priorityScore: AiService.calculateReportPriority(report),
    );

    _reports.insert(0, scored);
    _isLoading = false;
    notifyListeners();
    return scored;
  }

  void upvoteReport(String reportId, String userId) {
    final idx = _reports.indexWhere((r) => r.id == reportId);
    if (idx == -1) return;
    final report = _reports[idx];
    final alreadyVoted = report.upvotedByUserIds.contains(userId);
    final newIds = List<String>.from(report.upvotedByUserIds);
    if (alreadyVoted) {
      newIds.remove(userId);
    } else {
      newIds.add(userId);
    }
    final updated = report.copyWith(
      upvotes: newIds.length,
      upvotedByUserIds: newIds,
      priorityScore: AiService.calculateReportPriority(
        report.copyWith(upvotedByUserIds: newIds, upvotes: newIds.length),
      ),
    );
    _reports[idx] = updated;
    notifyListeners();
  }

  void addComment({
    required String reportId,
    required String userId,
    required String userName,
    required String text,
    bool isMunicipality = false,
    String? userPhotoUrl,
  }) {
    final idx = _reports.indexWhere((r) => r.id == reportId);
    if (idx == -1) return;
    final comment = ReportComment(
      id: _uuid.v4(),
      userId: userId,
      userName: userName,
      userPhotoUrl: userPhotoUrl,
      text: text,
      createdAt: DateTime.now(),
      isMunicipality: isMunicipality,
    );
    final updated = _reports[idx].copyWith(
      comments: [..._reports[idx].comments, comment],
    );
    _reports[idx] = updated;
    notifyListeners();
  }

  void updateReportStatus({
    required String reportId,
    required ReportStatus status,
    String? municipalityNote,
    String? assignedTo,
  }) {
    final idx = _reports.indexWhere((r) => r.id == reportId);
    if (idx == -1) return;
    _reports[idx] = _reports[idx].copyWith(
      status: status,
      municipalityNote: municipalityNote,
      assignedTo: assignedTo,
      updatedAt: DateTime.now(),
    );
    notifyListeners();
  }

  void setFilters({ReportCategory? category, ReportStatus? status}) {
    _filterCategory = category;
    _filterStatus = status;
    notifyListeners();
  }

  void setSearchQuery(String q) {
    _searchQuery = q;
    notifyListeners();
  }

  void clearFilters() {
    _filterCategory = null;
    _filterStatus = null;
    _searchQuery = '';
    notifyListeners();
  }

  Report? getById(String id) =>
      _reports.where((r) => r.id == id).firstOrNull;

  List<Report> _generateMockReports() {
    const baseLat = 41.9965;
    const baseLng = 21.4314;
    final now = DateTime.now();
    return [
      Report(
        id: _uuid.v4(),
        title: 'Large pothole on Ilindenska',
        description: 'Deep pothole about 40cm wide, causing traffic slowdown and vehicle damage. Needs urgent repair.',
        category: ReportCategory.pothole,
        status: ReportStatus.inProgress,
        lat: baseLat + 0.003,
        lng: baseLng + 0.002,
        address: 'Rruga Ilindenska 45, Skopje',
        userId: 'user_demo1',
        userName: 'Artan Kelmendi',
        imageUrls: [],
        createdAt: now.subtract(const Duration(hours: 18)),
        updatedAt: now.subtract(const Duration(hours: 5)),
        upvotes: 24,
        upvotedByUserIds: List.generate(24, (i) => 'user_$i'),
        priorityScore: 72,
        municipalityNote: 'Road maintenance team dispatched. Expected repair within 48 hours.',
        assignedTo: 'Road Maintenance Unit 3',
      ),
      Report(
        id: _uuid.v4(),
        title: 'Broken street light near school',
        description: 'Street light on the corner has been out for 3 days. Area is very dark at night, safety concern for students.',
        category: ReportCategory.streetLight,
        status: ReportStatus.pending,
        lat: baseLat - 0.004,
        lng: baseLng + 0.005,
        address: 'Bulevar Partizanski 12, Skopje',
        userId: 'user_demo2',
        userName: 'Marija Petrović',
        imageUrls: [],
        createdAt: now.subtract(const Duration(hours: 3)),
        upvotes: 11,
        upvotedByUserIds: List.generate(11, (i) => 'user_${i + 30}'),
        priorityScore: 45,
      ),
      Report(
        id: _uuid.v4(),
        title: 'Illegal waste dumping in park',
        description: 'Large pile of construction waste dumped illegally near the river park entrance. Blocking pedestrian path.',
        category: ReportCategory.illegalDumping,
        status: ReportStatus.resolved,
        lat: baseLat + 0.007,
        lng: baseLng - 0.003,
        address: 'River Park Entrance, Skopje',
        userId: 'user_demo3',
        userName: 'Burak Yıldız',
        imageUrls: [],
        createdAt: now.subtract(const Duration(days: 2)),
        updatedAt: now.subtract(const Duration(hours: 12)),
        upvotes: 35,
        upvotedByUserIds: List.generate(35, (i) => 'user_${i + 50}'),
        priorityScore: 80,
        municipalityNote: 'Waste removed. Perpetrator fined. Area restored.',
      ),
      Report(
        id: _uuid.v4(),
        title: 'Heavy traffic congestion downtown',
        description: 'Major traffic jam starting from Macedonia Square, extending 2km east. Signal timing seems off.',
        category: ReportCategory.traffic,
        status: ReportStatus.inProgress,
        lat: baseLat - 0.001,
        lng: baseLng - 0.002,
        address: 'Macedonia Square, Skopje',
        userId: 'user_demo4',
        userName: 'Elona Hoxha',
        imageUrls: [],
        createdAt: now.subtract(const Duration(hours: 1)),
        upvotes: 52,
        upvotedByUserIds: List.generate(52, (i) => 'user_${i + 100}'),
        priorityScore: 88,
      ),
      Report(
        id: _uuid.v4(),
        title: 'Flooding near Bit Pazar',
        description: 'Heavy rain caused flooding at intersection. Vehicles cannot pass. Drain appears blocked.',
        category: ReportCategory.flooding,
        status: ReportStatus.pending,
        lat: baseLat + 0.005,
        lng: baseLng + 0.008,
        address: 'Bit Pazar, Skopje',
        userId: 'user_demo5',
        userName: 'Sanja Nikolić',
        imageUrls: [],
        createdAt: now.subtract(const Duration(minutes: 30)),
        upvotes: 8,
        upvotedByUserIds: List.generate(8, (i) => 'user_${i + 160}'),
        priorityScore: 65,
      ),
    ];
  }
}
