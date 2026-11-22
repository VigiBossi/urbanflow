import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:urbanflow_ai/app.dart';
import 'package:urbanflow_ai/core/di/app_dependencies.dart';
import 'package:urbanflow_ai/data/services/location_service.dart';
import 'package:urbanflow_ai/features/auth/screens/login_screen.dart';
import 'package:urbanflow_ai/features/shell/screens/citizen_shell.dart';
import 'package:urbanflow_ai/features/shell/screens/municipality_shell.dart';

Future<void> _pumpApp(WidgetTester tester) async {
  tester.view.physicalSize = const Size(420, 900);
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  final deps = await AppDependencies.mock(
    latency: Duration.zero,
    locationService: const FixedLocationService(
      LocationResult.fallback(LocationStatus.denied),
    ),
  );
  await tester.pumpWidget(UrbanFlowApp(dependencies: deps));
  await tester.pumpAndSettle();
}

Future<void> _disposeApp(WidgetTester tester) async {
  // Removing the tree disposes providers and cancels their timers.
  await tester.pumpWidget(const SizedBox.shrink());
}

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  testWidgets('shows validation errors for empty fields', (tester) async {
    await _pumpApp(tester);
    expect(find.byType(LoginScreen), findsOneWidget);

    await tester.tap(find.byKey(const Key('login-submit')));
    await tester.pump();

    expect(find.text('Please enter your email'), findsOneWidget);
    expect(find.text('Please enter your password'), findsOneWidget);
    await _disposeApp(tester);
  });

  testWidgets('shows an error for wrong credentials', (tester) async {
    await _pumpApp(tester);
    await tester.enterText(
      find.byKey(const Key('login-email')),
      'user@example.com',
    );
    await tester.enterText(find.byKey(const Key('login-password')), 'nope123');
    await tester.tap(find.byKey(const Key('login-submit')));
    await tester.pumpAndSettle();

    expect(find.byKey(const Key('login-error')), findsOneWidget);
    expect(find.text('Incorrect email or password'), findsOneWidget);
    expect(find.byType(CitizenShell), findsNothing);
    await _disposeApp(tester);
  });

  testWidgets('citizen login opens the citizen home', (tester) async {
    await _pumpApp(tester);
    await tester.enterText(
      find.byKey(const Key('login-email')),
      'user@example.com',
    );
    await tester.enterText(
      find.byKey(const Key('login-password')),
      'password123',
    );
    await tester.tap(find.byKey(const Key('login-submit')));
    await tester.pumpAndSettle();

    expect(find.byType(CitizenShell), findsOneWidget);
    expect(find.text('AI Parking'), findsOneWidget);
    expect(find.byType(NavigationBar), findsOneWidget);
    await _disposeApp(tester);
  });

  testWidgets('municipality demo account opens the dashboard', (tester) async {
    await _pumpApp(tester);
    await tester.tap(find.text('municipality@urbanflow.ai'));
    await tester.tap(find.byKey(const Key('login-submit')));
    await tester.pumpAndSettle();

    expect(find.byType(MunicipalityShell), findsOneWidget);
    expect(find.text('City dashboard'), findsOneWidget);
    expect(find.text('AI insights'), findsOneWidget);
    await _disposeApp(tester);
  });

  testWidgets('language can be switched at runtime', (tester) async {
    await _pumpApp(tester);
    await tester.tap(find.byIcon(Icons.translate));
    await tester.pumpAndSettle();
    await tester.tap(
      find.ancestor(
        of: find.text('Македонски'),
        matching: find.byType(CheckedPopupMenuItem<Locale>),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Најави се'), findsOneWidget);
    await _disposeApp(tester);
  });
}
