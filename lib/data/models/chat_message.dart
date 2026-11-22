/// Quick replies offered as chips in the assistant chat.
enum QuickReply {
  findParking,
  parkingPrice,
  traffic,
  reportIssue,
  myReports,
  cityHours,
  emergency,
}

/// A single message in the assistant conversation.
class ChatMessage {
  const ChatMessage({
    required this.id,
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.suggestions = const [],
  });

  final String id;
  final String text;
  final bool isUser;
  final DateTime timestamp;

  /// Follow-up quick replies suggested by the assistant.
  final List<QuickReply> suggestions;

  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
    id: json['id'] as String,
    text: json['text'] as String,
    isUser: json['isUser'] as bool,
    timestamp: DateTime.parse(json['timestamp'] as String),
    suggestions: (json['suggestions'] as List<dynamic>? ?? const [])
        .map((e) => QuickReply.values.byName(e as String))
        .toList(),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'text': text,
    'isUser': isUser,
    'timestamp': timestamp.toIso8601String(),
    'suggestions': suggestions.map((s) => s.name).toList(),
  };
}
