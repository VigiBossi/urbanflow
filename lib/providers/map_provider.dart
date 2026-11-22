import 'package:flutter/foundation.dart';

import '../data/models/city_report.dart';
import '../data/repositories/report_repository.dart';
import 'view_status.dart';

/// City map state: public reports and visible layers.
class MapProvider extends ChangeNotifier {
  MapProvider(this._repository);

  final ReportRepository _repository;

  ViewStatus _status = ViewStatus.initial;
  List<CityReport> _reports = const [];
  bool _showParking = true;
  bool _showReports = true;

  ViewStatus get status => _status;
  bool get showParking => _showParking;
  bool get showReports => _showReports;

  /// Open reports shown on the map.
  List<CityReport> get openReports =>
      _reports.where((r) => r.isOpen).toList(growable: false);

  Future<void> load() async {
    _status = ViewStatus.loading;
    notifyListeners();
    try {
      _reports = await _repository.fetchReports();
      _status = ViewStatus.ready;
    } on Exception {
      _status = ViewStatus.error;
    }
    notifyListeners();
  }

  void toggleParking(bool value) {
    _showParking = value;
    notifyListeners();
  }

  void toggleReports(bool value) {
    _showReports = value;
    notifyListeners();
  }
}
