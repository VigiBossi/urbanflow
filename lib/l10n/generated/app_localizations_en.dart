// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appName => 'UrbanFlow AI';

  @override
  String get appTagline => 'Smart city services for Skopje';

  @override
  String get retry => 'Retry';

  @override
  String get cancel => 'Cancel';

  @override
  String get confirm => 'Confirm';

  @override
  String get save => 'Save';

  @override
  String get close => 'Close';

  @override
  String get ok => 'OK';

  @override
  String get send => 'Send';

  @override
  String get all => 'All';

  @override
  String get clearFilters => 'Clear filters';

  @override
  String get loading => 'Loading…';

  @override
  String get errorTitle => 'Something went wrong';

  @override
  String get errorMessage =>
      'We couldn\'t load the data. Check your connection and try again.';

  @override
  String get timeJustNow => 'just now';

  @override
  String timeMinutesAgo(int count) {
    return '$count min ago';
  }

  @override
  String timeHoursAgo(int count) {
    return '$count h ago';
  }

  @override
  String timeDaysAgo(int count) {
    return '$count d ago';
  }

  @override
  String currencyAmount(String amount) {
    return '$amount MKD';
  }

  @override
  String distanceMeters(String value) {
    return '$value m';
  }

  @override
  String distanceKilometers(String value) {
    return '$value km';
  }

  @override
  String durationHours(int count) {
    return '$count h';
  }

  @override
  String durationMinutes(int count) {
    return '$count min';
  }

  @override
  String durationHoursMinutes(int hours, int minutes) {
    return '$hours h $minutes min';
  }

  @override
  String get loginTitle => 'Welcome back';

  @override
  String get loginSubtitle => 'Sign in to continue';

  @override
  String get emailLabel => 'Email';

  @override
  String get passwordLabel => 'Password';

  @override
  String get emailRequired => 'Please enter your email';

  @override
  String get emailInvalid => 'Please enter a valid email address';

  @override
  String get passwordRequired => 'Please enter your password';

  @override
  String get passwordTooShort => 'Password must be at least 6 characters';

  @override
  String get signIn => 'Sign in';

  @override
  String get showPassword => 'Show password';

  @override
  String get hidePassword => 'Hide password';

  @override
  String get invalidCredentials => 'Incorrect email or password';

  @override
  String get networkError => 'Network error. Please try again.';

  @override
  String get demoAccounts => 'Demo accounts';

  @override
  String get demoAccountsHint => 'Tap an account to fill in the form';

  @override
  String get roleCitizen => 'Citizen';

  @override
  String get roleMunicipality => 'Municipality';

  @override
  String get logout => 'Log out';

  @override
  String get logoutConfirmTitle => 'Log out?';

  @override
  String get logoutConfirmMessage =>
      'You will need to sign in again to use the app.';

  @override
  String get navParking => 'Parking';

  @override
  String get navMap => 'Map';

  @override
  String get navReports => 'Reports';

  @override
  String get navAssistant => 'Assistant';

  @override
  String get navProfile => 'Profile';

  @override
  String get navDashboard => 'Dashboard';

  @override
  String get navManage => 'Manage';

  @override
  String get locationFallback =>
      'Location unavailable. Showing results around Skopje center.';

  @override
  String get locationEnable => 'Enable';

  @override
  String get useMyLocation => 'Use my location';

  @override
  String get locating => 'Finding your location…';

  @override
  String get parkingTitle => 'AI Parking';

  @override
  String get parkingSubtitle => 'Ranked for you right now';

  @override
  String get rankingPreference => 'Ranking preference';

  @override
  String get presetBalanced => 'Balanced';

  @override
  String get presetClosest => 'Closest';

  @override
  String get presetCheapest => 'Cheapest';

  @override
  String get presetAvailable => 'Most space';

  @override
  String get listView => 'List';

  @override
  String get mapView => 'Map';

  @override
  String spotsFree(int available, int capacity) {
    return '$available/$capacity free';
  }

  @override
  String get spotFull => 'Full';

  @override
  String get priceFree => 'Free';

  @override
  String pricePerHour(String price) {
    return '$price/h';
  }

  @override
  String scoreValue(int value) {
    return 'Score $value';
  }

  @override
  String get topPick => 'Top pick';

  @override
  String get whyThisSpot => 'Why this spot?';

  @override
  String get factorDistance => 'Distance';

  @override
  String get factorAvailability => 'Availability';

  @override
  String get factorPrice => 'Price';

  @override
  String get factorDemand => 'Demand at this hour';

  @override
  String get scoreExplanation =>
      'The score combines distance from you, free spaces, price and the expected demand for this time of day.';

  @override
  String get parkingTypeStreet => 'Street';

  @override
  String get parkingTypeGarage => 'Garage';

  @override
  String get parkingTypeLot => 'Parking lot';

  @override
  String zoneLabel(String zone) {
    return 'Zone $zone';
  }

  @override
  String get payAndPark => 'Pay & park';

  @override
  String get noSpotsTitle => 'No parking found';

  @override
  String get noSpotsMessage => 'There are no parking spots to show right now.';

  @override
  String lastUpdated(String time) {
    return 'Updated $time';
  }

  @override
  String get paymentTitle => 'Pay for parking';

  @override
  String get selectDuration => 'Duration';

  @override
  String get plateLabel => 'License plate';

  @override
  String get plateHint => 'SK 1234 AB';

  @override
  String get plateRequired => 'Please enter your license plate';

  @override
  String get plateInvalid => 'Use 4–10 letters and digits';

  @override
  String get paymentMethod => 'Payment method';

  @override
  String get paymentCard => 'Card •••• 4242';

  @override
  String get paymentWallet => 'Mobile wallet';

  @override
  String get paymentSms => 'SMS parking';

  @override
  String get totalLabel => 'Total';

  @override
  String payAmount(String amount) {
    return 'Pay $amount';
  }

  @override
  String get startFreeSession => 'Start session';

  @override
  String get mockPaymentNotice => 'Demo mode: no real payment is made.';

  @override
  String get paymentSuccess => 'Payment successful. Your session has started.';

  @override
  String get spotFullError =>
      'This parking spot is full. Please choose another one.';

  @override
  String get replaceSessionWarning =>
      'Starting a new session will end your current one.';

  @override
  String get activeSessionTitle => 'Parking session';

  @override
  String get timeRemaining => 'Time remaining';

  @override
  String endsAt(String time) {
    return 'Ends at $time';
  }

  @override
  String get extend => 'Extend';

  @override
  String get endSession => 'End session';

  @override
  String get endSessionConfirm =>
      'End your parking session now? Unused time is not refunded.';

  @override
  String get extendTitle => 'Extend session';

  @override
  String extendOption(String duration, String amount) {
    return 'Add $duration · $amount';
  }

  @override
  String get sessionExtended => 'Session extended';

  @override
  String get sessionEnded => 'Parking session ended';

  @override
  String get sessionExpiredTitle => 'Parking expired';

  @override
  String sessionExpiredMessage(String spot) {
    return 'Your session at $spot has expired. Move your car or start a new session to avoid a fine.';
  }

  @override
  String get sessionWarningTitle => '10 minutes left';

  @override
  String sessionWarningMessage(String spot) {
    return 'Your parking at $spot expires in less than 10 minutes.';
  }

  @override
  String sessionBanner(String spot, String time) {
    return 'Parking at $spot · $time left';
  }

  @override
  String get viewSession => 'View';

  @override
  String get noActiveSessionTitle => 'No active session';

  @override
  String get noActiveSessionMessage =>
      'Pick a parking spot to start a session.';

  @override
  String get amountPaid => 'Paid';

  @override
  String get startedAt => 'Started';

  @override
  String get sessionExpiredBadge => 'Expired';

  @override
  String get myReports => 'My reports';

  @override
  String get newReport => 'New report';

  @override
  String get categoryLabel => 'Category';

  @override
  String get categoryPothole => 'Pothole';

  @override
  String get categoryStreetlight => 'Broken streetlight';

  @override
  String get categoryGraffiti => 'Graffiti';

  @override
  String get categoryTrash => 'Trash';

  @override
  String get categoryDamagedSign => 'Damaged sign';

  @override
  String get categoryOther => 'Other';

  @override
  String get descriptionLabel => 'Description';

  @override
  String get descriptionHint => 'Describe the problem and where exactly it is';

  @override
  String get descriptionRequired => 'Please describe the problem';

  @override
  String get descriptionTooShort => 'Please add at least 10 characters';

  @override
  String get locationLabel => 'Location';

  @override
  String get pickOnMap => 'Pick on map';

  @override
  String get locationNotSet => 'No location selected';

  @override
  String get locationRequired => 'Please choose a location';

  @override
  String get addPhoto => 'Add photo';

  @override
  String get photoAttached => 'Photo attached';

  @override
  String get removePhoto => 'Remove photo';

  @override
  String get photoDemoNote => 'Photo upload is simulated in demo mode.';

  @override
  String get submitReport => 'Submit report';

  @override
  String get reportSubmitted => 'Report submitted. Thank you!';

  @override
  String get noReportsTitle => 'No reports yet';

  @override
  String get noReportsMessage =>
      'Spotted a problem in your neighborhood? Tap + to report it.';

  @override
  String get reportDetails => 'Report details';

  @override
  String get statusLabel => 'Status';

  @override
  String get statusSubmitted => 'Submitted';

  @override
  String get statusInReview => 'In review';

  @override
  String get statusInProgress => 'In progress';

  @override
  String get statusResolved => 'Resolved';

  @override
  String get priorityLabel => 'Priority';

  @override
  String get priorityLow => 'Low';

  @override
  String get priorityMedium => 'Medium';

  @override
  String get priorityHigh => 'High';

  @override
  String get priorityCritical => 'Critical';

  @override
  String reportedOn(String date) {
    return 'Reported $date';
  }

  @override
  String get neighborhoodLabel => 'Neighborhood';

  @override
  String get progressLabel => 'Progress';

  @override
  String get municipalityNotes => 'Updates from the municipality';

  @override
  String get noNotes => 'No updates yet';

  @override
  String get pickLocationTitle => 'Choose location';

  @override
  String get tapToPlace => 'Tap the map to place the pin';

  @override
  String get confirmLocation => 'Confirm location';

  @override
  String get photoLabel => 'Photo';

  @override
  String get manageReports => 'Manage reports';

  @override
  String get filterStatus => 'Status';

  @override
  String get filterCategory => 'Category';

  @override
  String get filterPriority => 'Priority';

  @override
  String get filterNeighborhood => 'Neighborhood';

  @override
  String get sortNewest => 'Newest first';

  @override
  String get sortPriority => 'Highest priority';

  @override
  String get assignTo => 'Assign to';

  @override
  String get assigneeLabel => 'Assignee';

  @override
  String get unassigned => 'Unassigned';

  @override
  String assignedTo(String name) {
    return 'Assigned to $name';
  }

  @override
  String get changeStatus => 'Change status';

  @override
  String get noStatusChanges => 'No further status changes available';

  @override
  String get notesLabel => 'Notes';

  @override
  String get addNote => 'Add note';

  @override
  String get noteHint => 'Write a note for the team and the citizen…';

  @override
  String get noteAdded => 'Note added';

  @override
  String get reportUpdated => 'Report updated';

  @override
  String get invalidTransition => 'This status change is not allowed';

  @override
  String get noMatchingTitle => 'No matching reports';

  @override
  String get noMatchingMessage => 'Try changing or clearing the filters.';

  @override
  String reportsCount(int count) {
    return '$count reports';
  }

  @override
  String get createdLabel => 'Created';

  @override
  String get departmentRoads => 'Roads';

  @override
  String get departmentLighting => 'Lighting';

  @override
  String get departmentSanitation => 'Sanitation';

  @override
  String get departmentPublicSpaces => 'Public spaces';

  @override
  String get cityMapTitle => 'City map';

  @override
  String get layersLabel => 'Layers';

  @override
  String get layerParking => 'Parking';

  @override
  String get layerReports => 'Reports';

  @override
  String get availabilityHigh => 'Plenty of space';

  @override
  String get availabilityMedium => 'Limited';

  @override
  String get availabilityLow => 'Almost full';

  @override
  String get availabilityNone => 'Full';

  @override
  String get mapAttribution => 'OpenStreetMap contributors';

  @override
  String clusterZoomHint(int count) {
    return '$count items here. Zoom in to see them.';
  }

  @override
  String get dashboardTitle => 'City dashboard';

  @override
  String greeting(String name) {
    return 'Hello, $name';
  }

  @override
  String get kpiOpenReports => 'Open reports';

  @override
  String get kpiAvgResolution => 'Avg. resolution';

  @override
  String get kpiOccupancy => 'Parking occupancy';

  @override
  String get kpiRevenue => 'Revenue today';

  @override
  String valueHours(String value) {
    return '$value h';
  }

  @override
  String valueDays(String value) {
    return '$value days';
  }

  @override
  String get notAvailable => 'n/a';

  @override
  String get chartByCategory => 'Reports by category';

  @override
  String get chartOverTime => 'Reports over the last 14 days';

  @override
  String get chartOccupancyByHour => 'Parking occupancy by hour (%)';

  @override
  String get aiInsights => 'AI insights';

  @override
  String get noInsights => 'No notable trends right now.';

  @override
  String get reportManagement => 'Report management';

  @override
  String get viewAll => 'View all';

  @override
  String insightSpike(String category, String neighborhood, int percent) {
    return '$category in $neighborhood up $percent% this week';
  }

  @override
  String insightDrop(String category, int percent) {
    return '$category reports down $percent% city-wide this week';
  }

  @override
  String insightHotspot(String neighborhood, int count) {
    return '$neighborhood has the most open reports ($count)';
  }

  @override
  String insightUnassigned(int count) {
    return '$count high-priority reports are still unassigned';
  }

  @override
  String insightSlowResolution(String category, String days) {
    return '$category: $days days to resolve on average';
  }

  @override
  String insightPeakOccupancy(String hour, int percent) {
    return 'Parking demand peaks around $hour at $percent%';
  }

  @override
  String insightFullParking(int count) {
    return '$count parking facilities are over 90% full';
  }

  @override
  String get assistantTitle => 'City assistant';

  @override
  String get assistantSubtitle => 'Parking, traffic and city services';

  @override
  String get assistantWelcome =>
      'Hi! I\'m your UrbanFlow assistant. Ask me about parking, traffic or city services.';

  @override
  String get messageHint => 'Ask me anything about the city…';

  @override
  String get assistantTyping => 'Assistant is typing…';

  @override
  String get clearChat => 'Clear chat';

  @override
  String get qrFindParking => 'Find parking near me';

  @override
  String get qrParkingPrice => 'Parking prices';

  @override
  String get qrTraffic => 'Traffic right now';

  @override
  String get qrReportIssue => 'How do I report an issue?';

  @override
  String get qrMyReports => 'Status of my reports';

  @override
  String get qrCityHours => 'City office hours';

  @override
  String get qrEmergency => 'Emergency numbers';

  @override
  String get aiGreeting => 'Hello! How can I help you today?';

  @override
  String get aiThanks => 'You\'re welcome! Anything else I can help with?';

  @override
  String get aiFallback =>
      'I\'m not sure I understood. I can help with parking, traffic, reports and city services.';

  @override
  String aiParkingBest(String name, String distance, int free, String price) {
    return 'Best option near you right now: $name, $distance away, $free free spaces, $price.';
  }

  @override
  String get aiParkingNone =>
      'I couldn\'t find free parking nearby right now. Try again in a few minutes.';

  @override
  String aiParkingPrices(String zoneA, String zoneB, String zoneC) {
    return 'Public parking in Skopje is priced by zone: Zone A $zoneA, Zone B $zoneB, Zone C $zoneC per hour. Many mall garages are free.';
  }

  @override
  String aiSessionActive(String name, String time) {
    return 'Your session at $name has $time remaining.';
  }

  @override
  String get aiSessionNone => 'You don\'t have an active parking session.';

  @override
  String aiTrafficHeavy(String streets) {
    return 'Traffic is heavy right now, especially on $streets. Allow extra time.';
  }

  @override
  String aiTrafficModerate(String streets) {
    return 'Traffic is moderate. Expect some delays on $streets.';
  }

  @override
  String get aiTrafficLight => 'Traffic is light across the city right now.';

  @override
  String get aiReportHowTo =>
      'Open Reports, tap +, choose a category, describe the problem and pin the location on the map. You can follow its status in My reports.';

  @override
  String aiReportStatus(int total, int open, int resolved) {
    return 'You have $total reports: $open open and $resolved resolved.';
  }

  @override
  String get aiReportStatusNone => 'You haven\'t submitted any reports yet.';

  @override
  String get aiCityHours =>
      'City of Skopje offices are open Monday to Friday, 08:00 to 16:00. Many services are also available online.';

  @override
  String get aiEmergency =>
      'Emergency numbers in North Macedonia: 112 general emergency, 192 police, 193 fire department, 194 ambulance.';

  @override
  String get aiTransport =>
      'City buses run from about 05:00 to 23:00. Main hubs are the Transport Center and the city center stops.';

  @override
  String get aiWaste =>
      'Waste is collected daily in central areas and two to three times a week elsewhere. Report overflowing bins in Reports.';

  @override
  String get settingsTitle => 'Profile & settings';

  @override
  String get signedInAs => 'Signed in as';

  @override
  String get appearance => 'Appearance';

  @override
  String get themeSystem => 'System';

  @override
  String get themeLight => 'Light';

  @override
  String get themeDark => 'Dark';

  @override
  String get languageLabel => 'Language';

  @override
  String get aboutLabel => 'About';

  @override
  String get aboutText =>
      'UrbanFlow AI helps citizens and the municipality of Skopje keep the city moving.';

  @override
  String versionLabel(String version) {
    return 'Version $version';
  }

  @override
  String get langEnglish => 'English';

  @override
  String get langAlbanian => 'Shqip';

  @override
  String get langMacedonian => 'Македонски';

  @override
  String get langTurkish => 'Türkçe';

  @override
  String get scoreLabel => 'Score';
}
