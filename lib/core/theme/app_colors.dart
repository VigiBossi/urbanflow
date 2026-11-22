import 'package:material_ui/material_ui.dart';

/// Semantic colors that are not part of the Material color scheme.
abstract final class AppColors {
  static const Color seed = Color(0xFF0B7A75);

  static const Color availabilityHigh = Color(0xFF2E9E5B);
  static const Color availabilityMedium = Color(0xFFE0A100);
  static const Color availabilityLow = Color(0xFFD64545);
  static const Color availabilityNone = Color(0xFF7A7A7A);

  static const Color priorityLow = Color(0xFF5B8DEF);
  static const Color priorityMedium = Color(0xFFE0A100);
  static const Color priorityHigh = Color(0xFFF0712C);
  static const Color priorityCritical = Color(0xFFD64545);

  static const Color statusSubmitted = Color(0xFF6C7A89);
  static const Color statusInReview = Color(0xFF5B8DEF);
  static const Color statusInProgress = Color(0xFFE0A100);
  static const Color statusResolved = Color(0xFF2E9E5B);

  /// Palette for categorical charts.
  static const List<Color> chartPalette = [
    Color(0xFF0B7A75),
    Color(0xFFF0712C),
    Color(0xFF5B8DEF),
    Color(0xFFD64545),
    Color(0xFF8E5BD6),
    Color(0xFFE0A100),
  ];

  /// Color for a parking spot based on its free-space ratio.
  static Color forAvailability(int available, int capacity) {
    if (available <= 0 || capacity <= 0) return availabilityNone;
    final ratio = available / capacity;
    if (ratio >= 0.4) return availabilityHigh;
    if (ratio >= 0.15) return availabilityMedium;
    return availabilityLow;
  }
}
