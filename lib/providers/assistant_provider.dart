import 'package:flutter/foundation.dart';
import 'package:latlong2/latlong.dart';

import '../core/utils/id_generator.dart';
import '../data/models/chat_message.dart';
import '../data/services/assistant_engine.dart';

/// Chat conversation with the city assistant.
class AssistantProvider extends ChangeNotifier {
  AssistantProvider(this._engine);

  final AssistantEngine _engine;
  final List<ChatMessage> _messages = [];
  bool _typing = false;
  bool _failed = false;

  List<ChatMessage> get messages => List.unmodifiable(_messages);
  bool get isTyping => _typing;

  /// True when the last request failed (UI offers a retry).
  bool get lastRequestFailed => _failed;

  static const List<QuickReply> starterSuggestions = [
    QuickReply.findParking,
    QuickReply.parkingPrice,
    QuickReply.traffic,
    QuickReply.reportIssue,
    QuickReply.myReports,
    QuickReply.cityHours,
    QuickReply.emergency,
  ];

  /// Quick replies to show under the conversation.
  List<QuickReply> get suggestions {
    for (final m in _messages.reversed) {
      if (!m.isUser) {
        return m.suggestions.isEmpty ? starterSuggestions : m.suggestions;
      }
    }
    return starterSuggestions;
  }

  Future<void> send(
    String text, {
    required String languageCode,
    String? userId,
    LatLng? location,
  }) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty || _typing) return;
    _messages.add(
      ChatMessage(
        id: IdGenerator.next('m'),
        text: trimmed,
        isUser: true,
        timestamp: DateTime.now(),
      ),
    );
    _typing = true;
    _failed = false;
    notifyListeners();
    try {
      final reply = await _engine.reply(
        trimmed,
        AssistantContext(
          languageCode: languageCode,
          userId: userId,
          location: location,
        ),
      );
      _messages.add(
        ChatMessage(
          id: IdGenerator.next('m'),
          text: reply.text,
          isUser: false,
          timestamp: DateTime.now(),
          suggestions: reply.suggestions,
        ),
      );
    } on Exception {
      _failed = true;
    } finally {
      _typing = false;
      notifyListeners();
    }
  }

  void clear() {
    _messages.clear();
    _failed = false;
    notifyListeners();
  }
}
