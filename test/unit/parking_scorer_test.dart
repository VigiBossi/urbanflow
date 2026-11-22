import 'package:flutter_test/flutter_test.dart';
import 'package:latlong2/latlong.dart';
import 'package:urbanflow_ai/data/models/parking_spot.dart';
import 'package:urbanflow_ai/data/services/parking_scorer.dart';

const _origin = LatLng(41.9981, 21.4254);

ParkingSpot _spot({
  required String id,
  double lat = 41.9981,
  double lng = 21.4254,
  int capacity = 100,
  int available = 50,
  double price = 50,
  double demand = 0.5,
}) => ParkingSpot(
  id: id,
  name: id,
  neighborhood: 'Centar',
  latitude: lat,
  longitude: lng,
  capacity: capacity,
  available: available,
  pricePerHour: price,
  type: ParkingType.lot,
  zone: 'A',
  hourlyDemand: List.filled(24, demand),
);

void main() {
  final noon = DateTime(2026, 5, 4, 12);

  group('sub-scores', () {
    const scorer = ParkingScorer(maxDistanceMeters: 2000, maxPricePerHour: 100);

    test('distance decays linearly and clamps to 0..1', () {
      expect(scorer.distanceScore(0), 1);
      expect(scorer.distanceScore(1000), closeTo(0.5, 1e-9));
      expect(scorer.distanceScore(5000), 0);
    });

    test('availability is the free-space ratio', () {
      expect(scorer.availabilityScore(_spot(id: 'a', available: 25)), 0.25);
      expect(scorer.availabilityScore(_spot(id: 'b', available: 0)), 0);
      expect(
        scorer.availabilityScore(_spot(id: 'c', capacity: 0, available: 0)),
        0,
      );
    });

    test('price: free is best, at or above max is worst', () {
      expect(scorer.priceScore(0), 1);
      expect(scorer.priceScore(50), closeTo(0.5, 1e-9));
      expect(scorer.priceScore(150), 0);
    });

    test('demand uses the hour of day', () {
      final spot = _spot(id: 'd').copyWith();
      final custom = ParkingSpot.fromJson({
        ...spot.toJson(),
        'hourlyDemand': [for (var h = 0; h < 24; h++) h == 8 ? 0.9 : 0.1],
      });
      expect(
        scorer.demandScore(custom, DateTime(2026, 1, 1, 8)),
        closeTo(0.1, 1e-9),
      );
      expect(
        scorer.demandScore(custom, DateTime(2026, 1, 1, 20)),
        closeTo(0.9, 1e-9),
      );
    });
  });

  test('total is the weighted mean scaled to 0..100', () {
    const scorer = ParkingScorer(
      weights: ScoringWeights(
        distance: 1,
        availability: 1,
        price: 1,
        demand: 1,
      ),
      maxPricePerHour: 100,
    );
    final result = scorer.score(
      _spot(id: 'x', available: 50, price: 50, demand: 0.5),
      _origin,
      noon,
    );
    // distance 1, availability .5, price .5, demand .5 -> mean .625
    expect(result.distanceMeters, closeTo(0, 1e-6));
    expect(result.score.total, closeTo(62.5, 1e-6));
  });

  test('zero weights yield a zero score instead of NaN', () {
    const scorer = ParkingScorer(
      weights: ScoringWeights(
        distance: 0,
        availability: 0,
        price: 0,
        demand: 0,
      ),
    );
    expect(scorer.score(_spot(id: 'z'), _origin, noon).score.total, 0);
  });

  group('rank', () {
    final near = _spot(id: 'near', lat: 41.9985, available: 20);
    final far = _spot(id: 'far', lat: 42.0150, available: 20);
    final cheap = _spot(id: 'cheap', lat: 42.0050, price: 0, available: 20);
    final full = _spot(id: 'full', available: 0, price: 0, demand: 0);

    test('closest preset prefers the nearest spot', () {
      const scorer = ParkingScorer(weights: ScoringWeights.closest);
      final ranked = scorer.rank([far, cheap, near], _origin, noon);
      expect(ranked.first.spot.id, 'near');
      expect(ranked.last.spot.id, 'far');
    });

    test('cheapest preset prefers the free spot', () {
      const scorer = ParkingScorer(weights: ScoringWeights.cheapest);
      final ranked = scorer.rank([far, near, cheap], _origin, noon);
      expect(ranked.first.spot.id, 'cheap');
    });

    test('full spots always rank last', () {
      const scorer = ParkingScorer();
      final ranked = scorer.rank([full, far, near], _origin, noon);
      expect(ranked.last.spot.id, 'full');
    });

    test('scores are within bounds and sorted descending', () {
      const scorer = ParkingScorer();
      final ranked = scorer.rank([far, near, cheap], _origin, noon);
      for (final r in ranked) {
        expect(r.score.total, inInclusiveRange(0, 100));
      }
      for (var i = 1; i < ranked.length; i++) {
        expect(
          ranked[i - 1].score.total,
          greaterThanOrEqualTo(ranked[i].score.total),
        );
      }
    });
  });
}
