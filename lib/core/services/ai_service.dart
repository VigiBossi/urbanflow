import 'dart:math';
import '../models/parking_spot_model.dart';
import '../models/report_model.dart';

class AiService {
  static final _rng = Random();

  /// Score and rank parking spots using multi-factor AI model.
  /// Factors: distance (40%), availability (30%), price (20%), time of day (10%).
  static List<ParkingSpot> rankParkingSpots({
    required List<ParkingSpot> spots,
    required double userLat,
    required double userLng,
  }) {
    final hour = DateTime.now().hour;
    final isPeakHour = (hour >= 8 && hour <= 9) || (hour >= 17 && hour <= 19);

    final scored = spots.map((spot) {
      if (spot.status == ParkingStatus.full ||
          spot.status == ParkingStatus.closed) {
        return spot.copyWith(aiScore: 0);
      }

      final distScore = spot.distanceMeters != null
          ? (1 - (spot.distanceMeters! / 2000).clamp(0.0, 1.0)) * 40
          : 20.0;

      final availRate = spot.totalSpots > 0
          ? spot.availableSpots / spot.totalSpots
          : 0.0;
      final availScore = availRate * 30;

      final maxPrice = spots
          .map((s) => s.pricePerHour)
          .reduce((a, b) => a > b ? a : b);
      final priceScore = maxPrice > 0
          ? (1 - spot.pricePerHour / maxPrice) * 20
          : 10.0;

      final timeBonus = isPeakHour && availRate > 0.5 ? 10.0 : 5.0;

      final total = distScore + availScore + priceScore + timeBonus;

      String reason;
      if (distScore > 30) {
        reason = 'Very close to you and highly available';
      } else if (availScore > 25) {
        reason = 'Plenty of spaces, low chance of congestion';
      } else if (priceScore > 15) {
        reason = 'Best price in the area';
      } else {
        reason = 'Good balance of distance, availability and price';
      }

      return spot.copyWith(
        aiScore: total.clamp(0, 100),
        aiReason: reason,
      );
    }).toList();

    scored.sort((a, b) => (b.aiScore ?? 0).compareTo(a.aiScore ?? 0));
    return scored;
  }

  /// Calculate AI priority score for a report (0–100).
  static int calculateReportPriority(Report report) {
    int score = 0;

    // Category severity
    const categorySeverity = {
      ReportCategory.accident: 35,
      ReportCategory.flooding: 30,
      ReportCategory.streetLight: 25,
      ReportCategory.pothole: 25,
      ReportCategory.illegalDumping: 20,
      ReportCategory.traffic: 20,
      ReportCategory.waste: 15,
      ReportCategory.vandalism: 15,
      ReportCategory.noisePollution: 10,
      ReportCategory.other: 5,
    };
    score += categorySeverity[report.category] ?? 5;

    // Community validation via upvotes
    score += (report.upvotes * 2).clamp(0, 25);

    // Time pressure — older unresolved reports get higher priority
    final hoursOld = DateTime.now().difference(report.createdAt).inHours;
    if (hoursOld > 72) score += 20;
    else if (hoursOld > 24) score += 10;
    else if (hoursOld > 8) score += 5;

    // Comment engagement
    score += report.comments.length.clamp(0, 10);

    // Has photo evidence
    if (report.imageUrls.isNotEmpty) score += 5;

    return score.clamp(0, 100);
  }

  /// Generate parking demand prediction text for a spot.
  static String getParkingPrediction(ParkingSpot spot) {
    final hour = DateTime.now().hour;
    final weekday = DateTime.now().weekday;
    final isWeekend = weekday == 6 || weekday == 7;

    if (isWeekend) {
      if (hour >= 10 && hour <= 14) {
        return 'High demand expected — weekend shopping hours. Book early!';
      }
      if (hour >= 18 && hour <= 22) {
        return 'Evening weekend rush. Availability likely to drop soon.';
      }
      return 'Moderate demand. Good time to park.';
    }

    if (hour >= 7 && hour <= 9) {
      return 'Morning rush hour. Spots filling fast — act now!';
    }
    if (hour >= 12 && hour <= 13) {
      return 'Lunch peak. Expect 30% more traffic in 15 minutes.';
    }
    if (hour >= 17 && hour <= 19) {
      return 'Evening rush. High competition for spots. Recommend this location.';
    }
    if (hour >= 22 || hour <= 6) {
      return 'Off-peak hours. Ample availability expected.';
    }
    return 'Normal demand. Availability stable for the next 2 hours.';
  }

  /// Generate AI insights for municipality analytics.
  static List<String> getMunicipalityInsights({
    required int totalReports,
    required int pendingReports,
    required int resolvedReports,
    required Map<ReportCategory, int> categoryBreakdown,
  }) {
    final insights = <String>[];
    final resolutionRate =
        totalReports > 0 ? (resolvedReports / totalReports * 100).round() : 0;

    if (resolutionRate < 40) {
      insights.add(
          'Resolution rate is below target. Consider allocating more resources to high-priority reports.');
    } else if (resolutionRate > 80) {
      insights.add(
          'Excellent resolution rate! Citizens are seeing fast responses.');
    }

    if (pendingReports > 20) {
      insights.add(
          '$pendingReports reports pending — consider batch processing by zone to improve efficiency.');
    }

    final topCategory = categoryBreakdown.entries.isEmpty
        ? null
        : categoryBreakdown.entries
            .reduce((a, b) => a.value > b.value ? a : b);
    if (topCategory != null) {
      insights.add(
          '${topCategory.key.name.toUpperCase()} is the most reported issue. A targeted city-wide inspection is recommended.');
    }

    insights.add(
        'AI Tip: Schedule preventive maintenance based on report hotspots to reduce future incident rates by up to 35%.');

    return insights;
  }

  /// Simulate API latency for realism.
  static Future<void> _simulateLatency() async {
    await Future.delayed(
        Duration(milliseconds: 400 + _rng.nextInt(400)));
  }

  /// Get city assistant response (integration point for Claude/OpenAI/Groq).
  static Future<String> getCityAssistantResponse(String query) async {
    await _simulateLatency();
    final q = query.toLowerCase();
    if (q.contains('park')) {
      return 'I found 8 parking spots near you. The best option is City Center Parking — 2 min walk, \$0.50/hr, 12 spots available. Want me to navigate you there?';
    }
    if (q.contains('report') || q.contains('pothole') || q.contains('light')) {
      return 'I can help you file a report. Tap the Report button and I\'ll pre-fill the location and suggest the category based on your description.';
    }
    if (q.contains('traffic')) {
      return 'Current traffic is moderate in the city center. I recommend using Rruga Ilindenska — 15% faster route right now.';
    }
    return 'I\'m your UrbanFlow AI assistant. I can help with parking, city reports, traffic, and navigation. What do you need?';
  }
}
