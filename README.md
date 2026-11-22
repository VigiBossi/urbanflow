# UrbanFlow AI

UrbanFlow AI is a smart-city app for **Skopje, North Macedonia**, built with Flutter for iOS and Android.

- **Citizens** find and pay for parking (ranked by a multi-factor "AI" score), report city issues and follow their status, browse a live city map, and chat with a city assistant.
- **Municipality staff** get a dashboard with KPIs, charts and rule-based AI insights. They also manage reports: filter, prioritize, assign, change status and add notes.

The app is available in **English, Albanian (sq), Macedonian (mk) and Turkish (tr)**, and you can switch language at runtime. It ships with a realistic **mock backend** that sits behind repository interfaces, so you can plug in a real API later.

---

## Tech stack

| Concern | Package (pinned) |
|---|---|
| UI | Flutter 3.50 / Dart 3.14, Material 3 via `material_ui` 1.11.1 |
| State management | `provider` 6.1.5+1 (`ChangeNotifier`) |
| Maps | `flutter_map` 8.3.2 + `latlong2` 0.10.1, OpenStreetMap tiles |
| Charts | `fl_chart` 1.3.1 |
| Location | `geolocator` 14.1.2 (permission handling, falls back to Skopje center) |
| Persistence | `shared_preferences` 2.5.6 |
| Localization | `flutter_localizations` + ARB files, `intl` 0.20.3 |

> **Note on `material_ui`:** Starting with Flutter 3.47, `package:flutter/material.dart` is deprecated in favor of the standalone [`material_ui`](https://pub.dev/packages/material_ui) package, and this app uses `material_ui`. `flutter_map` and `fl_chart` still import the legacy library internally. That is harmless here, because the app passes them explicit colors and text styles and draws its own OSM attribution widget. So the deprecated `MaterialUiCompatibilityBridge` is not needed.

## Getting started

### Prerequisites
- Flutter **3.50.x stable** or newer (`flutter --version`)
- Xcode 16+ for iOS, Android Studio / Android SDK 35+ for Android

### Setup and run
```bash
flutter pub get          # also generates lib/l10n/generated (flutter: generate: true)
flutter run              # pick an Android emulator / iOS simulator / device
```

Other useful commands:
```bash
flutter analyze          # passes with no issues
flutter test             # unit + widget tests
flutter gen-l10n         # regenerate localizations after editing ARB files
flutter build apk        # Android release build
flutter build ios        # iOS release build (requires macOS)
```

### Demo logins

| Role | Email | Password |
|---|---|---|
| Citizen | `user@example.com` | `password123` |
| Municipality / Admin | `municipality@urbanflow.ai` | `password123` |

The login screen has **Demo accounts** tiles that fill in the form for you. The session is persisted, so restarting the app keeps you signed in until you log out from **Profile**.

## Features

### AI Parking
- Spots are ranked by `ParkingScorer` (`lib/data/services/parking_scorer.dart`), a pure, unit-tested class. It combines four sub-scores, each from 0 to 1:
  - **distance** from GPS: linear decay up to `maxDistanceMeters`
  - **availability**: free spaces divided by capacity
  - **price**: linear decay up to `maxPricePerHour`
  - **time-of-day demand**: 1 minus the spot's hourly demand profile
- Weights are configurable through `ScoringWeights`. The UI offers presets: Balanced, Closest, Cheapest and Most space. Full spots always rank last.
- Each spot's detail sheet shows a **"Why this spot?"** breakdown with one bar per factor.
- **Mock payment flow**: choose a duration, license plate and payment method, then confirm. This starts a session.
- **Active session**: live countdown ring, extend or end, and an in-app banner on every citizen tab. A dialog appears when **10 minutes are left** and again **on expiry**.
- Availability refreshes every 30 s, so the map markers behave as "live".

### City reports
- Citizens create reports with a category (pothole, broken streetlight, graffiti, trash, damaged sign, other), a description, a location from GPS or picked on the map, and an optional photo placeholder.
- Status lifecycle (`ReportStatusFlow`): **Submitted → In Review → In Progress → Resolved**. Staff can also send a report back to review or reopen it, and invalid transitions are rejected.
- Municipality staff can filter (status, category, priority, neighborhood), sort, prioritize (Low/Medium/High/Critical), assign to staff, change status and add notes. On tablets this view is a data table.

### City map
- Interactive OpenStreetMap with parking markers color-coded by availability, report markers with category icons, layer toggles, a legend, and tap-to-open detail sheets.
- Report markers are grouped with grid-based **clustering** (`lib/core/utils/clustering.dart`). Tap a cluster to zoom in.

### Municipality dashboard
- KPI cards: open reports, average resolution time, parking occupancy, today's revenue.
- Charts: reports by category (pie), reports over the last 14 days (line), occupancy by hour (bar, with the current hour highlighted).
- **AI insights** from `InsightsEngine`: week-over-week spikes per neighborhood and category (for example "Pothole in Aerodrom up 40% this week"), drops, hotspots, unassigned high-priority reports, slow resolution and parking peaks. Insights are structured data that the UI localizes.
- A report management table showing the highest-priority open reports.

### AI Assistant
- Chat UI with quick-reply chips and a typing indicator.
- `IntentAssistantEngine` is a multilingual keyword and intent matcher. It handles Latin diacritics and Cyrillic, and answers with **live data**: the best parking spot near you, your session's remaining time, your reports' status, prices and traffic.

### Localization
- Every user-facing string lives in `lib/l10n/app_{en,sq,mk,tr}.arb`. Change the language from the translate icon on the login screen or from **Profile → Language**. The choice is persisted.

## Architecture

```
lib/
├── main.dart / app.dart     # composition root, providers, MaterialApp
├── core/                    # constants, theme, routing, DI, utils, shared widgets
├── data/
│   ├── models/              # immutable models with fromJson/toJson
│   ├── mock/                # Skopje seed data + simulated network latency
│   ├── repositories/        # abstract interfaces + mock/ implementations
│   └── services/            # pure logic: scorer, insights, analytics, assistant, location
├── providers/               # ChangeNotifiers (auth, settings, location, parking, reports, map, dashboard, assistant)
├── features/<feature>/      # screens/ and widgets/ per feature
└── l10n/                    # ARB files (+ generated/)
```

- **Role-based routing:** `RootGate` (`core/routing/app_router.dart`) shows a splash screen while restoring the session, then the login screen, then either `CitizenShell` or `MunicipalityShell`. Each role gets different navigation.
- **Responsive layouts:** phones get a bottom `NavigationBar`. Widths of 600 px and up get a `NavigationRail`. Widths of 840 px and up get split views (parking list and map, report detail and management panel), tables and multi-column dashboards.
- **States:** every data screen has loading, empty and error (retry) states (`core/widgets/state_views.dart`).

## Swapping the mock backend for a real API

All data access goes through interfaces in `lib/data/repositories/`:

- `AuthRepository`: `login`, `logout`
- `ParkingRepository`: spots, sessions (start/extend/end/expire), revenue
- `ReportRepository`: CRUD, status, priority, assignment, notes, staff
- `AssistantEngine` (`lib/data/services/assistant_engine.dart`): `reply(message, context)`

To switch:

1. Implement each interface against your API, for example with `package:http` or `dio`:
   ```dart
   class HttpReportRepository implements ReportRepository {
     HttpReportRepository(this._client, this._baseUrl);
     final http.Client _client;
     final Uri _baseUrl;

     @override
     Future<List<CityReport>> fetchReports({String? reporterId}) async {
       final res = await _client.get(_baseUrl.replace(
         path: '/reports',
         queryParameters: {if (reporterId != null) 'reporterId': reporterId},
       ));
       final list = jsonDecode(res.body) as List<dynamic>;
       return list.map((e) => CityReport.fromJson(e as Map<String, dynamic>)).toList();
     }
     // ...
   }
   ```
   The models already have `fromJson`/`toJson`.
2. Add a factory next to `AppDependencies.mock()` in `lib/core/di/app_dependencies.dart`, such as `AppDependencies.http(baseUrl: ...)`, that returns your implementations.
3. Call that factory in `lib/main.dart`. Providers and UI don't change.

**Plugging in an LLM:** implement `AssistantEngine.reply` by sending the message together with `AssistantContext` (language, user id, location) to your model endpoint. Keep the API key on your server, not in the app. You can return `QuickReply` suggestions to keep the chips.

Error contract: repositories throw `AuthException(AuthErrorCode)`, `ParkingException(code)`, `ReportNotFoundException` or `InvalidStatusTransition`. Providers turn these into localized messages.

## Platform setup

**Android** (`android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

**iOS** (`ios/Runner/Info.plist`):
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>UrbanFlow AI uses your location to rank nearby parking spots and to pin city reports.</string>
<key>CFBundleLocalizations</key>
<array><string>en</string><string>sq</string><string>mk</string><string>tr</string></array>
```

If location is denied or disabled, the app keeps working around **Skopje center (41.9981, 21.4254)** and shows a banner with an **Enable** button that opens system settings.

**Map tiles:** the app uses `tile.openstreetmap.org` with a package user agent and visible attribution, as the [OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/) requires. For production traffic, switch `AppConstants.osmTileUrl` to a commercial or self-hosted tile provider.

## Tests

```bash
flutter test
```

| File | Covers |
|---|---|
| `test/unit/parking_scorer_test.dart` | sub-scores, weighting, presets, ranking, full-spot ordering |
| `test/unit/auth_provider_test.dart` | login success and failure, roles, persisted and corrupt sessions, logout, notifications |
| `test/unit/report_status_flow_test.dart` | allowed and forbidden transitions, history, JSON round trip, repository enforcement |
| `test/unit/assistant_engine_test.dart` | multilingual intent matching and localized live answers |
| `test/unit/insights_engine_test.dart` | Aerodrom +40% pothole spike, severity ordering, dashboard aggregation |
| `test/widget/login_flow_test.dart` | validation, wrong credentials, role-based routing, runtime language switch |

## Resetting demo data
Mock reports and parking sessions are stored in `shared_preferences`. To start fresh, clear the app data (Android) or uninstall and reinstall the app.
