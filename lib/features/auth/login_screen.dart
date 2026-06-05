import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usernameController = TextEditingController();
  String _pin = '';
  bool _usernameSubmitted = false;

  @override
  void dispose() {
    _usernameController.dispose();
    super.dispose();
  }

  void _onDigit(String d) {
    if (_pin.length < 6) {
      setState(() => _pin += d);
    }
  }

  void _onDelete() {
    if (_pin.isNotEmpty) {
      setState(() => _pin = _pin.substring(0, _pin.length - 1));
    }
  }

  Future<void> _login() async {
    final auth = context.read<AuthProvider>();
    final username = _usernameController.text.trim();
    if (username.isEmpty || _pin.isEmpty) return;

    final success = await auth.login(username, _pin);
    if (!success && mounted) {
      setState(() => _pin = '');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildLogo(),
                const SizedBox(height: 48),
                _buildUsernameField(),
                const SizedBox(height: 32),
                _buildPinDisplay(),
                const SizedBox(height: 24),
                _buildNumpad(),
                const SizedBox(height: 24),
                _buildLoginButton(),
                _buildError(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLogo() {
    return Column(
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: AppColors.accent,
            borderRadius: BorderRadius.circular(20),
          ),
          child: const Icon(Icons.restaurant_menu, size: 44, color: Colors.white),
        ),
        const SizedBox(height: 16),
        const Text(
          'UrbanFlow POS',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 6),
        const Text(
          'Restaurant Point of Sale',
          style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
        ),
      ],
    );
  }

  Widget _buildUsernameField() {
    return TextField(
      controller: _usernameController,
      style: const TextStyle(color: AppColors.textPrimary, fontSize: 16),
      decoration: const InputDecoration(
        labelText: 'Username',
        hintText: 'e.g. waiter1',
        prefixIcon: Icon(Icons.person_outline, color: AppColors.textSecondary),
      ),
      textInputAction: TextInputAction.next,
      autocorrect: false,
    );
  }

  Widget _buildPinDisplay() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(6, (i) {
        final filled = i < _pin.length;
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 6),
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: filled ? AppColors.accent : AppColors.surface,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: filled ? AppColors.accent : AppColors.cardBorder,
              width: 2,
            ),
          ),
          child: filled
              ? const Icon(Icons.circle, size: 14, color: Colors.white)
              : null,
        );
      }),
    );
  }

  Widget _buildNumpad() {
    final digits = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', '⌫'],
    ];

    return Column(
      children: digits.map((row) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: row.map((d) {
              if (d.isEmpty) return const SizedBox(width: 90, height: 72);
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: SizedBox(
                  width: 90,
                  height: 72,
                  child: Material(
                    color: d == '⌫' ? AppColors.surfaceVariant : AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(12),
                      onTap: () => d == '⌫' ? _onDelete() : _onDigit(d),
                      child: Center(
                        child: d == '⌫'
                            ? const Icon(Icons.backspace_outlined, color: AppColors.textSecondary, size: 22)
                            : Text(d, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildLoginButton() {
    return Consumer<AuthProvider>(
      builder: (_, auth, __) => SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: auth.isLoading ? null : _login,
          child: auth.isLoading
              ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : const Text('Login'),
        ),
      ),
    );
  }

  Widget _buildError() {
    return Consumer<AuthProvider>(
      builder: (_, auth, __) {
        if (auth.error == null) return const SizedBox.shrink();
        return Padding(
          padding: const EdgeInsets.only(top: 16),
          child: Text(auth.error!, style: const TextStyle(color: AppColors.error, fontSize: 14)),
        );
      },
    );
  }
}
