import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/utils/l10n_ext.dart';
import '../../../core/utils/validators.dart';
import '../../../data/repositories/auth_repository.dart';
import '../../../providers/auth_provider.dart';
import '../widgets/app_logo.dart';
import '../widgets/language_menu_button.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    if (!(_formKey.currentState?.validate() ?? false)) return;
    await context.read<AuthProvider>().login(
      _emailController.text.trim(),
      _passwordController.text,
    );
  }

  void _fillDemo(String email) {
    _emailController.text = email;
    _passwordController.text = 'password123';
    context.read<AuthProvider>().clearError();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final theme = Theme.of(context);
    final auth = context.watch<AuthProvider>();
    final errorText = switch (auth.error) {
      AuthErrorCode.invalidCredentials => l10n.invalidCredentials,
      AuthErrorCode.network || AuthErrorCode.unknown => l10n.networkError,
      null => null,
    };

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        actions: const [
          LanguageMenuButton(),
          SizedBox(width: Spacing.sm),
        ],
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(Spacing.xl),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: AutofillGroup(
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Center(child: AppLogo(size: 72)),
                      const SizedBox(height: Spacing.lg),
                      Text(
                        l10n.appName,
                        textAlign: TextAlign.center,
                        style: theme.textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Text(
                        l10n.appTagline,
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: Spacing.xxl),
                      Text(l10n.loginTitle, style: theme.textTheme.titleLarge),
                      const SizedBox(height: Spacing.xs),
                      Text(
                        l10n.loginSubtitle,
                        style: theme.textTheme.bodyMedium,
                      ),
                      const SizedBox(height: Spacing.lg),
                      if (errorText != null) ...[
                        Material(
                          key: const Key('login-error'),
                          color: theme.colorScheme.errorContainer,
                          borderRadius: BorderRadius.circular(12),
                          child: Padding(
                            padding: const EdgeInsets.all(Spacing.md),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.error_outline,
                                  color: theme.colorScheme.onErrorContainer,
                                ),
                                const SizedBox(width: Spacing.sm),
                                Expanded(
                                  child: Text(
                                    errorText,
                                    style: TextStyle(
                                      color: theme.colorScheme.onErrorContainer,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: Spacing.lg),
                      ],
                      TextFormField(
                        key: const Key('login-email'),
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        autofillHints: const [AutofillHints.email],
                        enabled: !auth.isLoading,
                        decoration: InputDecoration(
                          labelText: l10n.emailLabel,
                          prefixIcon: const Icon(Icons.alternate_email),
                        ),
                        validator: (value) => switch (Validators.email(value)) {
                          ValidationError.required => l10n.emailRequired,
                          ValidationError.invalid => l10n.emailInvalid,
                          _ => null,
                        },
                      ),
                      const SizedBox(height: Spacing.md),
                      TextFormField(
                        key: const Key('login-password'),
                        controller: _passwordController,
                        obscureText: _obscure,
                        textInputAction: TextInputAction.done,
                        autofillHints: const [AutofillHints.password],
                        enabled: !auth.isLoading,
                        onFieldSubmitted: (_) => _submit(),
                        decoration: InputDecoration(
                          labelText: l10n.passwordLabel,
                          prefixIcon: const Icon(Icons.lock_outline),
                          suffixIcon: IconButton(
                            tooltip: _obscure
                                ? l10n.showPassword
                                : l10n.hidePassword,
                            icon: Icon(
                              _obscure
                                  ? Icons.visibility_outlined
                                  : Icons.visibility_off_outlined,
                            ),
                            onPressed: () =>
                                setState(() => _obscure = !_obscure),
                          ),
                        ),
                        validator: (value) =>
                            switch (Validators.password(value)) {
                              ValidationError.required => l10n.passwordRequired,
                              ValidationError.tooShort => l10n.passwordTooShort,
                              _ => null,
                            },
                      ),
                      const SizedBox(height: Spacing.xl),
                      FilledButton(
                        key: const Key('login-submit'),
                        onPressed: auth.isLoading ? null : _submit,
                        child: auth.isLoading
                            ? const SizedBox.square(
                                dimension: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                ),
                              )
                            : Text(l10n.signIn),
                      ),
                      const SizedBox(height: Spacing.xxl),
                      Text(
                        l10n.demoAccounts,
                        style: theme.textTheme.titleSmall,
                      ),
                      Text(
                        l10n.demoAccountsHint,
                        style: theme.textTheme.bodySmall,
                      ),
                      const SizedBox(height: Spacing.sm),
                      _DemoAccountTile(
                        icon: Icons.person_outline,
                        role: l10n.roleCitizen,
                        email: 'user@example.com',
                        onTap: auth.isLoading
                            ? null
                            : () => _fillDemo('user@example.com'),
                      ),
                      const SizedBox(height: Spacing.sm),
                      _DemoAccountTile(
                        icon: Icons.account_balance_outlined,
                        role: l10n.roleMunicipality,
                        email: 'municipality@urbanflow.ai',
                        onTap: auth.isLoading
                            ? null
                            : () => _fillDemo('municipality@urbanflow.ai'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _DemoAccountTile extends StatelessWidget {
  const _DemoAccountTile({
    required this.icon,
    required this.role,
    required this.email,
    required this.onTap,
  });

  final IconData icon;
  final String role;
  final String email;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) => Card(
    child: ListTile(
      leading: Icon(icon),
      title: Text(role),
      subtitle: Text(email),
      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
      onTap: onTap,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    ),
  );
}
