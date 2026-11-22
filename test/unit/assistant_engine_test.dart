import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:urbanflow_ai/data/models/chat_message.dart';
import 'package:urbanflow_ai/data/repositories/mock/mock_parking_repository.dart';
import 'package:urbanflow_ai/data/repositories/mock/mock_report_repository.dart';
import 'package:urbanflow_ai/data/services/assistant_engine.dart';
import 'package:urbanflow_ai/data/services/local_store.dart';

void main() {
  late IntentAssistantEngine engine;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    final store = LocalStore(await SharedPreferences.getInstance());
    engine = IntentAssistantEngine(
      parkingRepository: MockParkingRepository(store: store),
      reportRepository: MockReportRepository(store: store),
    );
  });

  test('classifies intents in all four languages', () {
    final cases = <String, AssistantIntent>{
      'Find parking near me': AssistantIntent.findParking,
      'How much does parking cost?': AssistantIntent.parkingPrice,
      'Gjej parking afër meje': AssistantIntent.findParking,
      'Çmimet e parkimit': AssistantIntent.parkingPrice,
      'Најди паркинг близу мене': AssistantIntent.findParking,
      'Сообраќај во моментов': AssistantIntent.traffic,
      'Yakınımda otopark bul': AssistantIntent.findParking,
      'Otopark fiyatları': AssistantIntent.parkingPrice,
      'Acil durum numaraları': AssistantIntent.emergency,
      'Итни броеви': AssistantIntent.emergency,
      'Status of my reports': AssistantIntent.myReports,
      'Statusi i raporteve të mia': AssistantIntent.myReports,
      'How do I report an issue?': AssistantIntent.reportHowTo,
      'City office hours': AssistantIntent.cityHours,
      'Hi': AssistantIntent.greeting,
      'Faleminderit!': AssistantIntent.thanks,
      'qwerty asdf': AssistantIntent.unknown,
    };
    cases.forEach((message, intent) {
      expect(engine.classify(message), intent, reason: message);
    });
  });

  test('short keywords only match whole words', () {
    // "hi" inside "this" must not be read as a greeting.
    expect(engine.classify('this thing'), AssistantIntent.unknown);
  });

  test('answers in the requested language with live parking data', () async {
    final en = await engine.reply(
      'find parking',
      const AssistantContext(languageCode: 'en'),
    );
    expect(en.intent, AssistantIntent.findParking);
    expect(en.text, contains('Best option'));

    final mk = await engine.reply(
      'паркинг',
      const AssistantContext(languageCode: 'mk'),
    );
    expect(mk.text, contains('Најдобра опција'));
  });

  test('unknown language codes fall back to English', () async {
    final reply = await engine.reply(
      'xyz',
      const AssistantContext(languageCode: 'de'),
    );
    expect(reply.intent, AssistantIntent.unknown);
    expect(reply.suggestions, contains(QuickReply.findParking));
  });

  test('reports status uses the user\'s reports', () async {
    final reply = await engine.reply(
      'status of my reports',
      const AssistantContext(languageCode: 'en', userId: 'u-citizen-1'),
    );
    expect(reply.text, startsWith('You have 3 reports'));
  });
}
