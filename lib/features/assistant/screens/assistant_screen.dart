import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/utils/enum_labels.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../core/widgets/responsive.dart';
import '../../../data/models/chat_message.dart';
import '../../../providers/assistant_provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/location_provider.dart';
import '../widgets/chat_bubble.dart';

/// Chat with the city assistant.
class AssistantScreen extends StatefulWidget {
  const AssistantScreen({super.key});

  @override
  State<AssistantScreen> createState() => _AssistantScreenState();
}

class _AssistantScreenState extends State<AssistantScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _send(String text) async {
    if (text.trim().isEmpty) return;
    _controller.clear();
    final languageCode = Localizations.localeOf(context).languageCode;
    final userId = context.read<AuthProvider>().user?.id;
    final location = context.read<LocationProvider>().position;
    final assistant = context.read<AssistantProvider>();
    final future = assistant.send(
      text,
      languageCode: languageCode,
      userId: userId,
      location: location,
    );
    _scrollToEnd();
    await future;
    _scrollToEnd();
  }

  void _scrollToEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final theme = Theme.of(context);
    final assistant = context.watch<AssistantProvider>();
    final messages = assistant.messages;
    final welcome = ChatMessage(
      id: 'welcome',
      text: l10n.assistantWelcome,
      isUser: false,
      timestamp: DateTime.now(),
    );

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            CircleAvatar(
              backgroundColor: theme.colorScheme.primaryContainer,
              child: Icon(
                Icons.smart_toy_outlined,
                color: theme.colorScheme.onPrimaryContainer,
              ),
            ),
            const SizedBox(width: Spacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(l10n.assistantTitle),
                  Text(
                    l10n.assistantSubtitle,
                    style: theme.textTheme.bodySmall,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          if (messages.isNotEmpty)
            IconButton(
              tooltip: l10n.clearChat,
              onPressed: assistant.clear,
              icon: const Icon(Icons.delete_sweep_outlined),
            ),
        ],
      ),
      body: MaxWidthBox(
        maxWidth: 820,
        child: Column(
          children: [
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: EdgeInsets.all(Responsive.pagePadding(context)),
                itemCount: messages.length + 1 + (assistant.isTyping ? 1 : 0),
                itemBuilder: (context, i) {
                  if (i == 0) return ChatBubble(message: welcome);
                  if (i <= messages.length) {
                    return ChatBubble(message: messages[i - 1]);
                  }
                  return TypingIndicator(label: l10n.assistantTyping);
                },
              ),
            ),
            if (assistant.lastRequestFailed)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: Spacing.lg),
                child: Text(
                  l10n.networkError,
                  style: TextStyle(color: theme.colorScheme.error),
                ),
              ),
            SizedBox(
              height: 48,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: Spacing.lg),
                itemCount: assistant.suggestions.length,
                separatorBuilder: (_, _) => const SizedBox(width: Spacing.sm),
                itemBuilder: (context, i) {
                  final label = assistant.suggestions[i].label(l10n);
                  return ActionChip(
                    label: Text(label),
                    onPressed: assistant.isTyping ? null : () => _send(label),
                  );
                },
              ),
            ),
            SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(
                  Spacing.lg,
                  Spacing.sm,
                  Spacing.sm,
                  Spacing.sm,
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        key: const Key('assistant-input'),
                        controller: _controller,
                        textInputAction: TextInputAction.send,
                        minLines: 1,
                        maxLines: 4,
                        onSubmitted: _send,
                        decoration: InputDecoration(
                          hintText: l10n.messageHint,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(24),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: Spacing.sm),
                    IconButton.filled(
                      tooltip: l10n.send,
                      onPressed: assistant.isTyping
                          ? null
                          : () => _send(_controller.text),
                      icon: const Icon(Icons.send),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
