import 'package:latlong2/latlong.dart';

/// Application-wide constants.
abstract final class AppConstants {
  /// Brand name (not translated).
  static const String appName = 'UrbanFlow AI';

  /// Geographic center of Skopje, used as the default map center and the
  /// location fallback when GPS is unavailable.
  static const LatLng skopjeCenter = LatLng(41.9981, 21.4254);

  static const double defaultMapZoom = 13.5;

  static const String osmTileUrl =
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  /// Identifies the app to the OSM tile servers (tile usage policy).
  static const String tileUserAgentPackage = 'mk.urbanflow.urbanflow_ai';

  /// ISO currency code used for parking prices.
  static const String currencyCode = 'MKD';

  /// Simulated network latency of the mock backend.
  static const Duration mockNetworkDelay = Duration(milliseconds: 650);

  /// How often parking availability is refreshed ("live" markers).
  static const Duration parkingRefreshInterval = Duration(seconds: 30);

  /// When to warn the driver that the parking session is about to expire.
  static const Duration sessionWarningThreshold = Duration(minutes: 10);

  /// Parking durations offered in the payment flow.
  static const List<Duration> parkingDurations = [
    Duration(minutes: 30),
    Duration(hours: 1),
    Duration(hours: 2),
    Duration(hours: 3),
    Duration(hours: 4),
  ];

  /// Durations offered when extending a session.
  static const List<Duration> extensionDurations = [
    Duration(minutes: 15),
    Duration(minutes: 30),
    Duration(hours: 1),
  ];
}

/// Keys used for shared_preferences persistence.
abstract final class StorageKeys {
  static const String session = 'uf.session.v1';
  static const String locale = 'uf.locale.v1';
  static const String themeMode = 'uf.themeMode.v1';
  static const String parkingSessions = 'uf.parkingSessions.v1';
  static const String reports = 'uf.reports.v1';
}

/// Layout breakpoints (Material 3 window size classes).
abstract final class Breakpoints {
  static const double medium = 600;
  static const double expanded = 840;
}

/// Spacing scale used throughout the UI.
abstract final class Spacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 24;
  static const double xxl = 32;
}
