import 'dart:math' as math;

/// Simulates network latency (and optionally failures) for mock repositories.
class MockNetwork {
  const MockNetwork({this.delay = Duration.zero, this.failureRate = 0});

  /// Zero-latency instance for tests.
  static const MockNetwork instant = MockNetwork();

  final Duration delay;

  /// Probability (0..1) that a call fails with [MockNetworkException].
  final double failureRate;

  static final math.Random _random = math.Random();

  Future<T> run<T>(T Function() body) async {
    if (delay > Duration.zero) {
      // Add +-25% jitter so loading states look natural.
      final jitter =
          (delay.inMilliseconds * 0.25 * (_random.nextDouble() * 2 - 1))
              .round();
      await Future<void>.delayed(
        Duration(milliseconds: delay.inMilliseconds + jitter),
      );
    }
    if (failureRate > 0 && _random.nextDouble() < failureRate) {
      throw const MockNetworkException();
    }
    return body();
  }
}

class MockNetworkException implements Exception {
  const MockNetworkException();

  @override
  String toString() => 'MockNetworkException: simulated network failure';
}
