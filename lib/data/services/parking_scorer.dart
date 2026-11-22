import 'package:latlong2/latlong.dart';

import '../../core/utils/geo_utils.dart';
import '../models/parking_spot.dart';

/// Relative importance of each ranking factor. Weights do not need to sum to
/// 1; they are normalized when scoring.
class ScoringWeights {
  const ScoringWeights({
    this.distance = 0.35,
    this.availability = 0.30,
    this.price = 0.20,
    this.demand = 0.15,
  }) : assert(distance >= 0 && availability >= 0 && price >= 0 && demand >= 0);

  final double distance;
  final double availability;
  final double price;
  final double demand;

  double get total => distance + availability + price + demand;

  static const ScoringWeights balanced = ScoringWeights();
  static const ScoringWeights closest = ScoringWeights(
    distance: 0.65,
    availability: 0.2,
    price: 0.05,
    demand: 0.1,
  );
  static const ScoringWeights cheapest = ScoringWeights(
    distance: 0.2,
    availability: 0.15,
    price: 0.55,
    demand: 0.1,
  );
  static const ScoringWeights mostAvailable = ScoringWeights(
    distance: 0.2,
    availability: 0.5,
    price: 0.1,
    demand: 0.2,
  );
}

/// Per-factor sub-scores (each 0..1, higher is better) and the weighted total
/// (0..100).
class ScoreBreakdown {
  const ScoreBreakdown({
    required this.distance,
    required this.availability,
    required this.price,
    required this.demand,
    required this.total,
  });

  final double distance;
  final double availability;
  final double price;
  final double demand;
  final double total;
}

/// A parking spot together with its distance and score.
class ScoredParkingSpot {
  const ScoredParkingSpot({
    required this.spot,
    required this.distanceMeters,
    required this.score,
  });

  final ParkingSpot spot;
  final double distanceMeters;
  final ScoreBreakdown score;
}

/// Multi-factor parking ranking ("AI Parking").
///
/// Each factor is mapped to a 0..1 sub-score:
/// * distance: linear decay from 1 at the origin to 0 at [maxDistanceMeters]
/// * availability: share of free spaces (0 when full)
/// * price: linear decay from 1 when free to 0 at [maxPricePerHour]
/// * demand: 1 - expected demand for the hour of day
///
/// The total is the weighted mean scaled to 0..100. Full spots are always
/// ranked after spots that have space.
class ParkingScorer {
  const ParkingScorer({
    this.weights = ScoringWeights.balanced,
    this.maxDistanceMeters = 3000,
    this.maxPricePerHour = 150,
  }) : assert(maxDistanceMeters > 0 && maxPricePerHour > 0);

  final ScoringWeights weights;
  final double maxDistanceMeters;
  final double maxPricePerHour;

  ParkingScorer withWeights(ScoringWeights weights) => ParkingScorer(
    weights: weights,
    maxDistanceMeters: maxDistanceMeters,
    maxPricePerHour: maxPricePerHour,
  );

  double distanceScore(double meters) =>
      (1 - meters / maxDistanceMeters).clamp(0.0, 1.0);

  double availabilityScore(ParkingSpot spot) =>
      spot.capacity <= 0 ? 0 : (spot.available / spot.capacity).clamp(0.0, 1.0);

  double priceScore(double pricePerHour) =>
      (1 - pricePerHour / maxPricePerHour).clamp(0.0, 1.0);

  double demandScore(ParkingSpot spot, DateTime time) =>
      (1 - spot.hourlyDemand[time.hour]).clamp(0.0, 1.0);

  ScoredParkingSpot score(ParkingSpot spot, LatLng origin, DateTime time) {
    final meters = GeoUtils.distanceMeters(origin, spot.position);
    final d = distanceScore(meters);
    final a = availabilityScore(spot);
    final p = priceScore(spot.pricePerHour);
    final m = demandScore(spot, time);
    final totalWeight = weights.total;
    final weighted = totalWeight == 0
        ? 0.0
        : (d * weights.distance +
                  a * weights.availability +
                  p * weights.price +
                  m * weights.demand) /
              totalWeight;
    return ScoredParkingSpot(
      spot: spot,
      distanceMeters: meters,
      score: ScoreBreakdown(
        distance: d,
        availability: a,
        price: p,
        demand: m,
        total: (weighted * 100).clamp(0.0, 100.0),
      ),
    );
  }

  /// Scores and sorts [spots], best first.
  List<ScoredParkingSpot> rank(
    Iterable<ParkingSpot> spots,
    LatLng origin,
    DateTime time,
  ) {
    final scored = spots.map((s) => score(s, origin, time)).toList();
    scored.sort((x, y) {
      if (x.spot.isFull != y.spot.isFull) return x.spot.isFull ? 1 : -1;
      final byScore = y.score.total.compareTo(x.score.total);
      if (byScore != 0) return byScore;
      return x.distanceMeters.compareTo(y.distanceMeters);
    });
    return scored;
  }
}
