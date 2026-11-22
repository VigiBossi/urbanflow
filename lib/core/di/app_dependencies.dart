import 'package:shared_preferences/shared_preferences.dart';

import '../../data/mock/mock_network.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/repositories/mock/mock_auth_repository.dart';
import '../../data/repositories/mock/mock_parking_repository.dart';
import '../../data/repositories/mock/mock_report_repository.dart';
import '../../data/repositories/parking_repository.dart';
import '../../data/repositories/report_repository.dart';
import '../../data/services/assistant_engine.dart';
import '../../data/services/local_store.dart';
import '../../data/services/location_service.dart';
import '../constants/app_constants.dart';

/// Composition root: the single place where backend implementations are
/// chosen. To use a real API, create e.g. `HttpReportRepository implements
/// ReportRepository` and return it from a new factory here.
class AppDependencies {
  const AppDependencies({
    required this.store,
    required this.authRepository,
    required this.parkingRepository,
    required this.reportRepository,
    required this.locationService,
    required this.assistantEngine,
  });

  final LocalStore store;
  final AuthRepository authRepository;
  final ParkingRepository parkingRepository;
  final ReportRepository reportRepository;
  final LocationService locationService;
  final AssistantEngine assistantEngine;

  /// Mock backend with simulated latency and Skopje data.
  static Future<AppDependencies> mock({
    Duration latency = AppConstants.mockNetworkDelay,
    LocationService locationService = const GeolocatorLocationService(),
  }) async {
    final store = LocalStore(await SharedPreferences.getInstance());
    final network = MockNetwork(delay: latency);
    final parking = MockParkingRepository(store: store, network: network);
    final reports = MockReportRepository(store: store, network: network);
    return AppDependencies(
      store: store,
      authRepository: MockAuthRepository(network: network),
      parkingRepository: parking,
      reportRepository: reports,
      locationService: locationService,
      assistantEngine: IntentAssistantEngine(
        parkingRepository: parking,
        reportRepository: reports,
        network: MockNetwork(delay: latency),
      ),
    );
  }
}
