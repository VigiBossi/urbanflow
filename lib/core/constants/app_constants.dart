class AppConstants {
  static const appVersion = '1.0.0';
  static const appName = 'UrbanFlow AI';

  // Map defaults (Skopje, North Macedonia)
  static const defaultLat = 41.9965;
  static const defaultLng = 21.4314;
  static const defaultZoom = 14.0;
  static const tileUrlTemplate =
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  static const tileAttribution = '© OpenStreetMap contributors';

  // Parking
  static const maxParkingHours = 24;
  static const minParkingMinutes = 30;
  static const parkingStepMinutes = 30;

  // Reports
  static const maxImagesPerReport = 5;
  static const maxCommentLength = 500;

  // Premium
  static const premiumMonthlyPrice = 4.99;
  static const premiumYearlyPrice = 39.99;
}
