# Building UrbanFlow POS for Windows

## Prerequisites
- Flutter SDK (stable channel)
- Visual Studio 2022 with "Desktop development with C++" workload
- Inno Setup 6 (for installer)

## Build Steps

```bash
# 1. Enable Windows desktop support
flutter config --enable-windows-desktop

# 2. Get dependencies
flutter pub get

# 3. Build release
flutter build windows --release

# 4. Output location
# build/windows/x64/runner/Release/urbanflow_ai.exe
```

## Create Installer (optional)
1. Install Inno Setup 6 from https://jrsoftware.org/isinfo.php
2. Open `installer/urbanflow_setup.iss` in Inno Setup
3. Click Build → Compile
4. Installer will be at `installer_output/UrbanFlow_POS_Setup.exe`

## Demo Accounts
| Role    | Username  | PIN  |
|---------|-----------|------|
| Waiter  | waiter1   | 1234 |
| Manager | manager1  | 9999 |

## First Run
Menu data is seeded automatically on first launch.
To re-seed: Login as manager → Dashboard → Menu tab → "Reseed Menu"
