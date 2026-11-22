import 'package:intl/intl.dart';

import '../../l10n/generated/app_localizations.dart';

/// Locale-aware formatting helpers that combine intl with localized strings.
class Formatters {
  Formatters(this.l10n) : _locale = l10n.localeName;

  final AppLocalizations l10n;
  final String _locale;

  String money(double amount) =>
      l10n.currencyAmount(NumberFormat.decimalPattern(_locale).format(amount));

  /// "Free" for zero, otherwise "60 MKD/h".
  String pricePerHour(double price) =>
      price <= 0 ? l10n.priceFree : l10n.pricePerHour(money(price));

  String distance(double meters) {
    if (meters < 1000) {
      final rounded = ((meters / 10).round() * 10).clamp(10, 990);
      return l10n.distanceMeters(rounded.toString());
    }
    return l10n.distanceKilometers(
      NumberFormat('0.0', _locale).format(meters / 1000),
    );
  }

  /// Human-friendly duration such as "1 h 30 min".
  String duration(Duration d) {
    final hours = d.inHours;
    final minutes = d.inMinutes.remainder(60);
    if (hours == 0) return l10n.durationMinutes(minutes);
    if (minutes == 0) return l10n.durationHours(hours);
    return l10n.durationHoursMinutes(hours, minutes);
  }

  /// Countdown clock "01:23:45".
  static String countdown(Duration d) {
    String two(int n) => n.toString().padLeft(2, '0');
    return '${two(d.inHours)}:${two(d.inMinutes.remainder(60))}:'
        '${two(d.inSeconds.remainder(60))}';
  }

  String time(DateTime t) => DateFormat.Hm(_locale).format(t);

  String hourLabel(int hour) =>
      DateFormat.Hm(_locale).format(DateTime(2000, 1, 1, hour));

  String date(DateTime t) => DateFormat.yMMMd(_locale).format(t);

  String dateTime(DateTime t) => DateFormat.yMMMd(_locale).add_Hm().format(t);

  String shortDay(DateTime t) => DateFormat.Md(_locale).format(t);

  String relative(DateTime t, {DateTime? now}) {
    final diff = (now ?? DateTime.now()).difference(t);
    if (diff.inMinutes < 1) return l10n.timeJustNow;
    if (diff.inHours < 1) return l10n.timeMinutesAgo(diff.inMinutes);
    if (diff.inDays < 1) return l10n.timeHoursAgo(diff.inHours);
    if (diff.inDays < 7) return l10n.timeDaysAgo(diff.inDays);
    return date(t);
  }

  String number(num value, {int decimals = 0}) =>
      NumberFormat.decimalPatternDigits(
        locale: _locale,
        decimalDigits: decimals,
      ).format(value);

  String percent(double ratio) =>
      NumberFormat.percentPattern(_locale).format(ratio);
}
