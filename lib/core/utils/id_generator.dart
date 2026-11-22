import 'dart:math' as math;

/// Generates short unique-enough identifiers for locally created records.
abstract final class IdGenerator {
  static final math.Random _random = math.Random();

  static String next(String prefix) {
    final time = DateTime.now().microsecondsSinceEpoch.toRadixString(36);
    final rand = _random.nextInt(0x7fffffff).toRadixString(36);
    return '$prefix-$time$rand';
  }
}
