import 'package:flutter/foundation.dart';

import '../data/models/dashboard_data.dart';
import '../data/repositories/parking_repository.dart';
import '../data/repositories/report_repository.dart';
import '../data/services/analytics_service.dart';
import 'view_status.dart';

/// Municipality dashboard metrics.
class DashboardProvider extends ChangeNotifier {
  DashboardProvider({
    required ReportRepository reportRepository,
    required ParkingRepository parkingRepository,
    this.analytics = const AnalyticsService(),
    DateTime Function()? clock,
  }) : _reports = reportRepository,
       _parking = parkingRepository,
       _clock = clock ?? DateTime.now;

  final ReportRepository _reports;
  final ParkingRepository _parking;
  final AnalyticsService analytics;
  final DateTime Function() _clock;

  ViewStatus _status = ViewStatus.initial;
  DashboardData? _data;

  ViewStatus get status => _status;
  DashboardData? get data => _data;

  Future<void> load() async {
    _status = ViewStatus.loading;
    notifyListeners();
    try {
      final (reports, spots, revenue) = await (
        _reports.fetchReports(),
        _parking.fetchSpots(),
        _parking.revenueToday(),
      ).wait;
      _data = analytics.build(
        reports: reports,
        spots: spots,
        revenueToday: revenue,
        now: _clock(),
      );
      _status = ViewStatus.ready;
    } on Object {
      _status = ViewStatus.error;
    }
    notifyListeners();
  }
}
