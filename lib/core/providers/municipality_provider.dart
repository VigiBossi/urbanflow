import 'package:flutter/material.dart';
import '../models/report_model.dart';
import '../services/ai_service.dart';

class MunicipalityProvider extends ChangeNotifier {
  bool _isLoading = false;
  String? _selectedAssignee;
  final List<String> _staffList = [
    'Road Maintenance Unit 1',
    'Road Maintenance Unit 2',
    'Road Maintenance Unit 3',
    'Electrical Services',
    'Waste Management',
    'Parks & Recreation',
    'Traffic Control',
    'Emergency Response',
  ];

  bool get isLoading => _isLoading;
  List<String> get staffList => _staffList;
  String? get selectedAssignee => _selectedAssignee;

  Map<String, dynamic> getAnalyticsSummary(List<Report> reports) {
    if (reports.isEmpty) {
      return {
        'total': 0,
        'pending': 0,
        'inProgress': 0,
        'resolved': 0,
        'resolutionRate': 0.0,
        'avgResponseHours': 0,
        'insights': <String>[],
      };
    }

    final pending =
        reports.where((r) => r.status == ReportStatus.pending).length;
    final inProgress =
        reports.where((r) => r.status == ReportStatus.inProgress).length;
    final resolved =
        reports.where((r) => r.status == ReportStatus.resolved).length;

    final resolutionRate =
        reports.isNotEmpty ? (resolved / reports.length * 100) : 0.0;

    final resolvedReports =
        reports.where((r) => r.updatedAt != null).toList();
    final avgResponseHours = resolvedReports.isNotEmpty
        ? resolvedReports
                .map((r) => r.updatedAt!.difference(r.createdAt).inHours)
                .reduce((a, b) => a + b) ~/
            resolvedReports.length
        : 0;

    final categoryBreakdown = <ReportCategory, int>{};
    for (final r in reports) {
      categoryBreakdown[r.category] = (categoryBreakdown[r.category] ?? 0) + 1;
    }

    final insights = AiService.getMunicipalityInsights(
      totalReports: reports.length,
      pendingReports: pending,
      resolvedReports: resolved,
      categoryBreakdown: categoryBreakdown,
    );

    return {
      'total': reports.length,
      'pending': pending,
      'inProgress': inProgress,
      'resolved': resolved,
      'resolutionRate': resolutionRate,
      'avgResponseHours': avgResponseHours,
      'categoryBreakdown': categoryBreakdown,
      'insights': insights,
    };
  }

  Future<void> assignAndUpdateReport({
    required String reportId,
    required ReportStatus status,
    required String assignedTo,
    required String note,
    required Function(String, ReportStatus, String, String) updateCallback,
  }) async {
    _isLoading = true;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 600));

    updateCallback(reportId, status, note, assignedTo);

    _isLoading = false;
    notifyListeners();
  }

  void selectAssignee(String? assignee) {
    _selectedAssignee = assignee;
    notifyListeners();
  }
}
