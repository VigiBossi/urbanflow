import 'dart:ui';

import 'package:latlong2/latlong.dart';

import '../../core/constants/app_constants.dart';
import '../../core/utils/formatters.dart';
import '../../l10n/generated/app_localizations.dart';
import '../mock/mock_network.dart';
import '../models/chat_message.dart';
import '../models/city_report.dart';
import '../repositories/parking_repository.dart';
import '../repositories/report_repository.dart';
import 'parking_scorer.dart';

/// Information about the user that the assistant can use in answers.
class AssistantContext {
  const AssistantContext({
    required this.languageCode,
    this.userId,
    this.location,
    this.now,
  });

  final String languageCode;
  final String? userId;
  final LatLng? location;

  /// Overrides the current time (tests).
  final DateTime? now;
}

class AssistantReply {
  const AssistantReply({
    required this.text,
    this.intent,
    this.suggestions = const [],
  });

  final String text;
  final AssistantIntent? intent;
  final List<QuickReply> suggestions;
}

/// Contract for the chat assistant. Implement this with an LLM-backed client
/// (e.g. an HTTP call to your model endpoint) to replace the mock engine.
abstract interface class AssistantEngine {
  Future<AssistantReply> reply(String message, AssistantContext context);
}

enum AssistantIntent {
  emergency,
  myReports,
  parkingSession,
  parkingPrice,
  findParking,
  traffic,
  reportHowTo,
  waste,
  transport,
  cityHours,
  thanks,
  greeting,
  unknown,
}

/// Keyword-based multilingual intent matcher (English, Albanian, Macedonian,
/// Turkish) that answers with live data from the repositories.
class IntentAssistantEngine implements AssistantEngine {
  IntentAssistantEngine({
    required this.parkingRepository,
    required this.reportRepository,
    this.scorer = const ParkingScorer(),
    this.network = MockNetwork.instant,
  });

  final ParkingRepository parkingRepository;
  final ReportRepository reportRepository;
  final ParkingScorer scorer;

  /// Simulated "thinking" latency.
  final MockNetwork network;

  /// Keywords per intent, in priority order (first match wins). Keywords are
  /// matched against a lower-cased message with Latin diacritics removed.
  static const Map<AssistantIntent, List<String>> keywords = {
    AssistantIntent.emergency: [
      'emergency', 'police', 'ambulance', 'fire', '112', //
      'urgjenc', 'polic', 'ambulanc', 'zjarr',
      'итни', 'итен', 'итна', 'полиција', 'амбулант', 'пожар', 'брза помош',
      'acil', 'polis', 'ambulans', 'itfaiye',
    ],
    AssistantIntent.myReports: [
      'my report', 'status of my', 'my complaint', //
      'raportet e mia', 'raporti im', 'statusi i raport',
      'мои пријави', 'моите пријави', 'моја пријава', 'статус на мои',
      'bildirimlerim', 'bildirimimin', 'raporlarim',
    ],
    AssistantIntent.parkingSession: [
      'my session', 'time left', 'my parking', 'remaining', //
      'seanca', 'sesioni', 'koha e mbetur',
      'сесија', 'преостанат',
      'oturum', 'kalan sure',
    ],
    AssistantIntent.parkingPrice: [
      'price', 'cost', 'how much', 'fee', 'tariff', //
      'cmim', 'sa kushton', 'tarif',
      'цена', 'цени', 'колку чини', 'чини',
      'fiyat', 'ucret', 'ne kadar',
    ],
    AssistantIntent.findParking: [
      'parking', 'park', 'garage', //
      'parkim', 'parko', 'garazh',
      'паркинг', 'паркира', 'гаража',
      'otopark', 'park yeri',
    ],
    AssistantIntent.traffic: [
      'traffic', 'jam', 'congestion', 'road', //
      'trafik', 'bllokim',
      'сообраќај', 'гужва', 'метеж',
      'yogun', 'kaza',
    ],
    AssistantIntent.reportHowTo: [
      'report', 'pothole', 'broken', 'graffiti', 'streetlight', 'complain', //
      'raport', 'grope', 'prishur', 'ndricim',
      'пријав', 'дупка', 'расипан', 'графит',
      'bildir', 'sikayet', 'cukur', 'ariza',
    ],
    AssistantIntent.waste: [
      'garbage', 'waste', 'trash', 'recycl', //
      'mbeturin', 'plehra',
      'ѓубре', 'отпад',
      'cop', 'atik',
    ],
    AssistantIntent.transport: [
      'bus', 'transport', 'tram', 'taxi', //
      'autobus', 'transporti',
      'автобус', 'превоз', 'такси',
      'otobus', 'ulasim', 'taksi',
    ],
    AssistantIntent.cityHours: [
      'hours', 'open', 'office', 'city hall', 'working time', //
      'orar', 'zyr', 'komun',
      'работно време', 'канцеларија', 'општина', 'град скопје',
      'calisma saat', 'mesai', 'belediye',
    ],
    AssistantIntent.thanks: [
      'thank', 'thx', //
      'faleminderit', 'flm',
      'благодарам', 'фала',
      'tesekkur', 'sagol',
    ],
    AssistantIntent.greeting: [
      'hello', 'hi', 'hey', 'good morning', //
      'pershendetje', 'tung', 'mirdita',
      'здраво', 'добар ден', 'добро утро',
      'merhaba', 'selam', 'gunaydin',
    ],
  };

  static const Map<String, String> _latinFold = {
    'ë': 'e', 'ç': 'c', 'ş': 's', 'ğ': 'g', 'ı': 'i', 'ü': 'u', 'ö': 'o', //
    'č': 'c', 'š': 's', 'ž': 'z', 'ć': 'c', 'đ': 'd', 'â': 'a', 'î': 'i',
  };

  static String normalize(String input) {
    final lower = input.toLowerCase().replaceAll('İ'.toLowerCase(), 'i');
    final buffer = StringBuffer();
    for (final rune in lower.runes) {
      final char = String.fromCharCode(rune);
      buffer.write(_latinFold[char] ?? char);
    }
    return buffer.toString();
  }

  /// Returns the best matching intent for [message].
  AssistantIntent classify(String message) {
    final text = ' ${normalize(message)} ';
    for (final entry in keywords.entries) {
      for (final keyword in entry.value) {
        // Very short keywords must match whole words to avoid false hits.
        final matches = keyword.length <= 3
            ? RegExp(
                '(^|[^\\p{L}])${RegExp.escape(keyword)}([^\\p{L}]|\$)',
                unicode: true,
              ).hasMatch(text)
            : text.contains(keyword);
        if (matches) return entry.key;
      }
    }
    return AssistantIntent.unknown;
  }

  static AppLocalizations _l10n(String code) {
    final supported = AppLocalizations.supportedLocales
        .map((l) => l.languageCode)
        .contains(code);
    return lookupAppLocalizations(Locale(supported ? code : 'en'));
  }

  @override
  Future<AssistantReply> reply(String message, AssistantContext context) async {
    final l10n = _l10n(context.languageCode);
    final fmt = Formatters(l10n);
    final now = context.now ?? DateTime.now();
    final intent = await network.run(() => classify(message));

    switch (intent) {
      case AssistantIntent.emergency:
        return AssistantReply(text: l10n.aiEmergency, intent: intent);
      case AssistantIntent.myReports:
        return _myReports(l10n, context, intent);
      case AssistantIntent.parkingSession:
        return _session(l10n, fmt, context, now, intent);
      case AssistantIntent.parkingPrice:
        return AssistantReply(
          text: l10n.aiParkingPrices(
            fmt.money(60),
            fmt.money(40),
            fmt.money(20),
          ),
          intent: intent,
          suggestions: const [QuickReply.findParking],
        );
      case AssistantIntent.findParking:
        return _findParking(l10n, fmt, context, now, intent);
      case AssistantIntent.traffic:
        return AssistantReply(
          text: _traffic(l10n, now),
          intent: intent,
          suggestions: const [QuickReply.findParking],
        );
      case AssistantIntent.reportHowTo:
        return AssistantReply(
          text: l10n.aiReportHowTo,
          intent: intent,
          suggestions: const [QuickReply.myReports],
        );
      case AssistantIntent.waste:
        return AssistantReply(
          text: l10n.aiWaste,
          intent: intent,
          suggestions: const [QuickReply.reportIssue],
        );
      case AssistantIntent.transport:
        return AssistantReply(
          text: l10n.aiTransport,
          intent: intent,
          suggestions: const [QuickReply.traffic],
        );
      case AssistantIntent.cityHours:
        return AssistantReply(text: l10n.aiCityHours, intent: intent);
      case AssistantIntent.thanks:
        return AssistantReply(text: l10n.aiThanks, intent: intent);
      case AssistantIntent.greeting:
        return AssistantReply(
          text: l10n.aiGreeting,
          intent: intent,
          suggestions: const [
            QuickReply.findParking,
            QuickReply.traffic,
            QuickReply.reportIssue,
          ],
        );
      case AssistantIntent.unknown:
        return AssistantReply(
          text: l10n.aiFallback,
          intent: intent,
          suggestions: const [
            QuickReply.findParking,
            QuickReply.parkingPrice,
            QuickReply.traffic,
            QuickReply.cityHours,
          ],
        );
    }
  }

  Future<AssistantReply> _findParking(
    AppLocalizations l10n,
    Formatters fmt,
    AssistantContext context,
    DateTime now,
    AssistantIntent intent,
  ) async {
    final spots = await parkingRepository.fetchSpots();
    final origin = context.location ?? AppConstants.skopjeCenter;
    final ranked = scorer.rank(spots, origin, now);
    if (ranked.isEmpty || ranked.first.spot.isFull) {
      return AssistantReply(text: l10n.aiParkingNone, intent: intent);
    }
    final best = ranked.first;
    return AssistantReply(
      text: l10n.aiParkingBest(
        best.spot.name,
        fmt.distance(best.distanceMeters),
        best.spot.available,
        fmt.pricePerHour(best.spot.pricePerHour),
      ),
      intent: intent,
      suggestions: const [QuickReply.parkingPrice, QuickReply.traffic],
    );
  }

  Future<AssistantReply> _session(
    AppLocalizations l10n,
    Formatters fmt,
    AssistantContext context,
    DateTime now,
    AssistantIntent intent,
  ) async {
    final userId = context.userId;
    final session = userId == null
        ? null
        : await parkingRepository.activeSession(userId);
    if (session == null || session.remaining(now) == Duration.zero) {
      return AssistantReply(
        text: l10n.aiSessionNone,
        intent: intent,
        suggestions: const [QuickReply.findParking],
      );
    }
    return AssistantReply(
      text: l10n.aiSessionActive(
        session.spotName,
        fmt.duration(session.remaining(now)),
      ),
      intent: intent,
    );
  }

  Future<AssistantReply> _myReports(
    AppLocalizations l10n,
    AssistantContext context,
    AssistantIntent intent,
  ) async {
    final userId = context.userId;
    final reports = userId == null
        ? const <CityReport>[]
        : await reportRepository.fetchReports(reporterId: userId);
    if (reports.isEmpty) {
      return AssistantReply(
        text: l10n.aiReportStatusNone,
        intent: intent,
        suggestions: const [QuickReply.reportIssue],
      );
    }
    final resolved = reports.where((r) => !r.isOpen).length;
    return AssistantReply(
      text: l10n.aiReportStatus(
        reports.length,
        reports.length - resolved,
        resolved,
      ),
      intent: intent,
    );
  }

  /// Simulated traffic based on typical Skopje rush hours.
  String _traffic(AppLocalizations l10n, DateTime now) {
    final hour = now.hour;
    final weekend = now.weekday >= DateTime.saturday;
    const streets = 'Partizanski Odredi, Ilindenska, Kuzman Josifovski Pitu';
    final rush = (hour >= 7 && hour < 10) || (hour >= 15 && hour < 19);
    if (!weekend && rush) return l10n.aiTrafficHeavy(streets);
    if (hour >= 10 && hour < 21) return l10n.aiTrafficModerate(streets);
    return l10n.aiTrafficLight;
  }
}
