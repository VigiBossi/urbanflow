import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_mk.dart';
import 'app_localizations_sq.dart';
import 'app_localizations_tr.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'generated/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('mk'),
    Locale('sq'),
    Locale('tr'),
  ];

  /// No description provided for @appName.
  ///
  /// In en, this message translates to:
  /// **'UrbanFlow AI'**
  String get appName;

  /// No description provided for @appTagline.
  ///
  /// In en, this message translates to:
  /// **'Smart city services for Skopje'**
  String get appTagline;

  /// No description provided for @retry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retry;

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @confirm.
  ///
  /// In en, this message translates to:
  /// **'Confirm'**
  String get confirm;

  /// No description provided for @save.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;

  /// No description provided for @close.
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get close;

  /// No description provided for @ok.
  ///
  /// In en, this message translates to:
  /// **'OK'**
  String get ok;

  /// No description provided for @send.
  ///
  /// In en, this message translates to:
  /// **'Send'**
  String get send;

  /// No description provided for @all.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get all;

  /// No description provided for @clearFilters.
  ///
  /// In en, this message translates to:
  /// **'Clear filters'**
  String get clearFilters;

  /// No description provided for @loading.
  ///
  /// In en, this message translates to:
  /// **'Loading…'**
  String get loading;

  /// No description provided for @errorTitle.
  ///
  /// In en, this message translates to:
  /// **'Something went wrong'**
  String get errorTitle;

  /// No description provided for @errorMessage.
  ///
  /// In en, this message translates to:
  /// **'We couldn\'t load the data. Check your connection and try again.'**
  String get errorMessage;

  /// No description provided for @timeJustNow.
  ///
  /// In en, this message translates to:
  /// **'just now'**
  String get timeJustNow;

  /// No description provided for @timeMinutesAgo.
  ///
  /// In en, this message translates to:
  /// **'{count} min ago'**
  String timeMinutesAgo(int count);

  /// No description provided for @timeHoursAgo.
  ///
  /// In en, this message translates to:
  /// **'{count} h ago'**
  String timeHoursAgo(int count);

  /// No description provided for @timeDaysAgo.
  ///
  /// In en, this message translates to:
  /// **'{count} d ago'**
  String timeDaysAgo(int count);

  /// No description provided for @currencyAmount.
  ///
  /// In en, this message translates to:
  /// **'{amount} MKD'**
  String currencyAmount(String amount);

  /// No description provided for @distanceMeters.
  ///
  /// In en, this message translates to:
  /// **'{value} m'**
  String distanceMeters(String value);

  /// No description provided for @distanceKilometers.
  ///
  /// In en, this message translates to:
  /// **'{value} km'**
  String distanceKilometers(String value);

  /// No description provided for @durationHours.
  ///
  /// In en, this message translates to:
  /// **'{count} h'**
  String durationHours(int count);

  /// No description provided for @durationMinutes.
  ///
  /// In en, this message translates to:
  /// **'{count} min'**
  String durationMinutes(int count);

  /// No description provided for @durationHoursMinutes.
  ///
  /// In en, this message translates to:
  /// **'{hours} h {minutes} min'**
  String durationHoursMinutes(int hours, int minutes);

  /// No description provided for @loginTitle.
  ///
  /// In en, this message translates to:
  /// **'Welcome back'**
  String get loginTitle;

  /// No description provided for @loginSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Sign in to continue'**
  String get loginSubtitle;

  /// No description provided for @emailLabel.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get emailLabel;

  /// No description provided for @passwordLabel.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get passwordLabel;

  /// No description provided for @emailRequired.
  ///
  /// In en, this message translates to:
  /// **'Please enter your email'**
  String get emailRequired;

  /// No description provided for @emailInvalid.
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid email address'**
  String get emailInvalid;

  /// No description provided for @passwordRequired.
  ///
  /// In en, this message translates to:
  /// **'Please enter your password'**
  String get passwordRequired;

  /// No description provided for @passwordTooShort.
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 6 characters'**
  String get passwordTooShort;

  /// No description provided for @signIn.
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get signIn;

  /// No description provided for @showPassword.
  ///
  /// In en, this message translates to:
  /// **'Show password'**
  String get showPassword;

  /// No description provided for @hidePassword.
  ///
  /// In en, this message translates to:
  /// **'Hide password'**
  String get hidePassword;

  /// No description provided for @invalidCredentials.
  ///
  /// In en, this message translates to:
  /// **'Incorrect email or password'**
  String get invalidCredentials;

  /// No description provided for @networkError.
  ///
  /// In en, this message translates to:
  /// **'Network error. Please try again.'**
  String get networkError;

  /// No description provided for @demoAccounts.
  ///
  /// In en, this message translates to:
  /// **'Demo accounts'**
  String get demoAccounts;

  /// No description provided for @demoAccountsHint.
  ///
  /// In en, this message translates to:
  /// **'Tap an account to fill in the form'**
  String get demoAccountsHint;

  /// No description provided for @roleCitizen.
  ///
  /// In en, this message translates to:
  /// **'Citizen'**
  String get roleCitizen;

  /// No description provided for @roleMunicipality.
  ///
  /// In en, this message translates to:
  /// **'Municipality'**
  String get roleMunicipality;

  /// No description provided for @logout.
  ///
  /// In en, this message translates to:
  /// **'Log out'**
  String get logout;

  /// No description provided for @logoutConfirmTitle.
  ///
  /// In en, this message translates to:
  /// **'Log out?'**
  String get logoutConfirmTitle;

  /// No description provided for @logoutConfirmMessage.
  ///
  /// In en, this message translates to:
  /// **'You will need to sign in again to use the app.'**
  String get logoutConfirmMessage;

  /// No description provided for @navParking.
  ///
  /// In en, this message translates to:
  /// **'Parking'**
  String get navParking;

  /// No description provided for @navMap.
  ///
  /// In en, this message translates to:
  /// **'Map'**
  String get navMap;

  /// No description provided for @navReports.
  ///
  /// In en, this message translates to:
  /// **'Reports'**
  String get navReports;

  /// No description provided for @navAssistant.
  ///
  /// In en, this message translates to:
  /// **'Assistant'**
  String get navAssistant;

  /// No description provided for @navProfile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get navProfile;

  /// No description provided for @navDashboard.
  ///
  /// In en, this message translates to:
  /// **'Dashboard'**
  String get navDashboard;

  /// No description provided for @navManage.
  ///
  /// In en, this message translates to:
  /// **'Manage'**
  String get navManage;

  /// No description provided for @locationFallback.
  ///
  /// In en, this message translates to:
  /// **'Location unavailable. Showing results around Skopje center.'**
  String get locationFallback;

  /// No description provided for @locationEnable.
  ///
  /// In en, this message translates to:
  /// **'Enable'**
  String get locationEnable;

  /// No description provided for @useMyLocation.
  ///
  /// In en, this message translates to:
  /// **'Use my location'**
  String get useMyLocation;

  /// No description provided for @locating.
  ///
  /// In en, this message translates to:
  /// **'Finding your location…'**
  String get locating;

  /// No description provided for @parkingTitle.
  ///
  /// In en, this message translates to:
  /// **'AI Parking'**
  String get parkingTitle;

  /// No description provided for @parkingSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Ranked for you right now'**
  String get parkingSubtitle;

  /// No description provided for @rankingPreference.
  ///
  /// In en, this message translates to:
  /// **'Ranking preference'**
  String get rankingPreference;

  /// No description provided for @presetBalanced.
  ///
  /// In en, this message translates to:
  /// **'Balanced'**
  String get presetBalanced;

  /// No description provided for @presetClosest.
  ///
  /// In en, this message translates to:
  /// **'Closest'**
  String get presetClosest;

  /// No description provided for @presetCheapest.
  ///
  /// In en, this message translates to:
  /// **'Cheapest'**
  String get presetCheapest;

  /// No description provided for @presetAvailable.
  ///
  /// In en, this message translates to:
  /// **'Most space'**
  String get presetAvailable;

  /// No description provided for @listView.
  ///
  /// In en, this message translates to:
  /// **'List'**
  String get listView;

  /// No description provided for @mapView.
  ///
  /// In en, this message translates to:
  /// **'Map'**
  String get mapView;

  /// No description provided for @spotsFree.
  ///
  /// In en, this message translates to:
  /// **'{available}/{capacity} free'**
  String spotsFree(int available, int capacity);

  /// No description provided for @spotFull.
  ///
  /// In en, this message translates to:
  /// **'Full'**
  String get spotFull;

  /// No description provided for @priceFree.
  ///
  /// In en, this message translates to:
  /// **'Free'**
  String get priceFree;

  /// No description provided for @pricePerHour.
  ///
  /// In en, this message translates to:
  /// **'{price}/h'**
  String pricePerHour(String price);

  /// No description provided for @scoreValue.
  ///
  /// In en, this message translates to:
  /// **'Score {value}'**
  String scoreValue(int value);

  /// No description provided for @topPick.
  ///
  /// In en, this message translates to:
  /// **'Top pick'**
  String get topPick;

  /// No description provided for @whyThisSpot.
  ///
  /// In en, this message translates to:
  /// **'Why this spot?'**
  String get whyThisSpot;

  /// No description provided for @factorDistance.
  ///
  /// In en, this message translates to:
  /// **'Distance'**
  String get factorDistance;

  /// No description provided for @factorAvailability.
  ///
  /// In en, this message translates to:
  /// **'Availability'**
  String get factorAvailability;

  /// No description provided for @factorPrice.
  ///
  /// In en, this message translates to:
  /// **'Price'**
  String get factorPrice;

  /// No description provided for @factorDemand.
  ///
  /// In en, this message translates to:
  /// **'Demand at this hour'**
  String get factorDemand;

  /// No description provided for @scoreExplanation.
  ///
  /// In en, this message translates to:
  /// **'The score combines distance from you, free spaces, price and the expected demand for this time of day.'**
  String get scoreExplanation;

  /// No description provided for @parkingTypeStreet.
  ///
  /// In en, this message translates to:
  /// **'Street'**
  String get parkingTypeStreet;

  /// No description provided for @parkingTypeGarage.
  ///
  /// In en, this message translates to:
  /// **'Garage'**
  String get parkingTypeGarage;

  /// No description provided for @parkingTypeLot.
  ///
  /// In en, this message translates to:
  /// **'Parking lot'**
  String get parkingTypeLot;

  /// No description provided for @zoneLabel.
  ///
  /// In en, this message translates to:
  /// **'Zone {zone}'**
  String zoneLabel(String zone);

  /// No description provided for @payAndPark.
  ///
  /// In en, this message translates to:
  /// **'Pay & park'**
  String get payAndPark;

  /// No description provided for @noSpotsTitle.
  ///
  /// In en, this message translates to:
  /// **'No parking found'**
  String get noSpotsTitle;

  /// No description provided for @noSpotsMessage.
  ///
  /// In en, this message translates to:
  /// **'There are no parking spots to show right now.'**
  String get noSpotsMessage;

  /// No description provided for @lastUpdated.
  ///
  /// In en, this message translates to:
  /// **'Updated {time}'**
  String lastUpdated(String time);

  /// No description provided for @paymentTitle.
  ///
  /// In en, this message translates to:
  /// **'Pay for parking'**
  String get paymentTitle;

  /// No description provided for @selectDuration.
  ///
  /// In en, this message translates to:
  /// **'Duration'**
  String get selectDuration;

  /// No description provided for @plateLabel.
  ///
  /// In en, this message translates to:
  /// **'License plate'**
  String get plateLabel;

  /// No description provided for @plateHint.
  ///
  /// In en, this message translates to:
  /// **'SK 1234 AB'**
  String get plateHint;

  /// No description provided for @plateRequired.
  ///
  /// In en, this message translates to:
  /// **'Please enter your license plate'**
  String get plateRequired;

  /// No description provided for @plateInvalid.
  ///
  /// In en, this message translates to:
  /// **'Use 4–10 letters and digits'**
  String get plateInvalid;

  /// No description provided for @paymentMethod.
  ///
  /// In en, this message translates to:
  /// **'Payment method'**
  String get paymentMethod;

  /// No description provided for @paymentCard.
  ///
  /// In en, this message translates to:
  /// **'Card •••• 4242'**
  String get paymentCard;

  /// No description provided for @paymentWallet.
  ///
  /// In en, this message translates to:
  /// **'Mobile wallet'**
  String get paymentWallet;

  /// No description provided for @paymentSms.
  ///
  /// In en, this message translates to:
  /// **'SMS parking'**
  String get paymentSms;

  /// No description provided for @totalLabel.
  ///
  /// In en, this message translates to:
  /// **'Total'**
  String get totalLabel;

  /// No description provided for @payAmount.
  ///
  /// In en, this message translates to:
  /// **'Pay {amount}'**
  String payAmount(String amount);

  /// No description provided for @startFreeSession.
  ///
  /// In en, this message translates to:
  /// **'Start session'**
  String get startFreeSession;

  /// No description provided for @mockPaymentNotice.
  ///
  /// In en, this message translates to:
  /// **'Demo mode: no real payment is made.'**
  String get mockPaymentNotice;

  /// No description provided for @paymentSuccess.
  ///
  /// In en, this message translates to:
  /// **'Payment successful. Your session has started.'**
  String get paymentSuccess;

  /// No description provided for @spotFullError.
  ///
  /// In en, this message translates to:
  /// **'This parking spot is full. Please choose another one.'**
  String get spotFullError;

  /// No description provided for @replaceSessionWarning.
  ///
  /// In en, this message translates to:
  /// **'Starting a new session will end your current one.'**
  String get replaceSessionWarning;

  /// No description provided for @activeSessionTitle.
  ///
  /// In en, this message translates to:
  /// **'Parking session'**
  String get activeSessionTitle;

  /// No description provided for @timeRemaining.
  ///
  /// In en, this message translates to:
  /// **'Time remaining'**
  String get timeRemaining;

  /// No description provided for @endsAt.
  ///
  /// In en, this message translates to:
  /// **'Ends at {time}'**
  String endsAt(String time);

  /// No description provided for @extend.
  ///
  /// In en, this message translates to:
  /// **'Extend'**
  String get extend;

  /// No description provided for @endSession.
  ///
  /// In en, this message translates to:
  /// **'End session'**
  String get endSession;

  /// No description provided for @endSessionConfirm.
  ///
  /// In en, this message translates to:
  /// **'End your parking session now? Unused time is not refunded.'**
  String get endSessionConfirm;

  /// No description provided for @extendTitle.
  ///
  /// In en, this message translates to:
  /// **'Extend session'**
  String get extendTitle;

  /// No description provided for @extendOption.
  ///
  /// In en, this message translates to:
  /// **'Add {duration} · {amount}'**
  String extendOption(String duration, String amount);

  /// No description provided for @sessionExtended.
  ///
  /// In en, this message translates to:
  /// **'Session extended'**
  String get sessionExtended;

  /// No description provided for @sessionEnded.
  ///
  /// In en, this message translates to:
  /// **'Parking session ended'**
  String get sessionEnded;

  /// No description provided for @sessionExpiredTitle.
  ///
  /// In en, this message translates to:
  /// **'Parking expired'**
  String get sessionExpiredTitle;

  /// No description provided for @sessionExpiredMessage.
  ///
  /// In en, this message translates to:
  /// **'Your session at {spot} has expired. Move your car or start a new session to avoid a fine.'**
  String sessionExpiredMessage(String spot);

  /// No description provided for @sessionWarningTitle.
  ///
  /// In en, this message translates to:
  /// **'10 minutes left'**
  String get sessionWarningTitle;

  /// No description provided for @sessionWarningMessage.
  ///
  /// In en, this message translates to:
  /// **'Your parking at {spot} expires in less than 10 minutes.'**
  String sessionWarningMessage(String spot);

  /// No description provided for @sessionBanner.
  ///
  /// In en, this message translates to:
  /// **'Parking at {spot} · {time} left'**
  String sessionBanner(String spot, String time);

  /// No description provided for @viewSession.
  ///
  /// In en, this message translates to:
  /// **'View'**
  String get viewSession;

  /// No description provided for @noActiveSessionTitle.
  ///
  /// In en, this message translates to:
  /// **'No active session'**
  String get noActiveSessionTitle;

  /// No description provided for @noActiveSessionMessage.
  ///
  /// In en, this message translates to:
  /// **'Pick a parking spot to start a session.'**
  String get noActiveSessionMessage;

  /// No description provided for @amountPaid.
  ///
  /// In en, this message translates to:
  /// **'Paid'**
  String get amountPaid;

  /// No description provided for @startedAt.
  ///
  /// In en, this message translates to:
  /// **'Started'**
  String get startedAt;

  /// No description provided for @sessionExpiredBadge.
  ///
  /// In en, this message translates to:
  /// **'Expired'**
  String get sessionExpiredBadge;

  /// No description provided for @myReports.
  ///
  /// In en, this message translates to:
  /// **'My reports'**
  String get myReports;

  /// No description provided for @newReport.
  ///
  /// In en, this message translates to:
  /// **'New report'**
  String get newReport;

  /// No description provided for @categoryLabel.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get categoryLabel;

  /// No description provided for @categoryPothole.
  ///
  /// In en, this message translates to:
  /// **'Pothole'**
  String get categoryPothole;

  /// No description provided for @categoryStreetlight.
  ///
  /// In en, this message translates to:
  /// **'Broken streetlight'**
  String get categoryStreetlight;

  /// No description provided for @categoryGraffiti.
  ///
  /// In en, this message translates to:
  /// **'Graffiti'**
  String get categoryGraffiti;

  /// No description provided for @categoryTrash.
  ///
  /// In en, this message translates to:
  /// **'Trash'**
  String get categoryTrash;

  /// No description provided for @categoryDamagedSign.
  ///
  /// In en, this message translates to:
  /// **'Damaged sign'**
  String get categoryDamagedSign;

  /// No description provided for @categoryOther.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get categoryOther;

  /// No description provided for @descriptionLabel.
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get descriptionLabel;

  /// No description provided for @descriptionHint.
  ///
  /// In en, this message translates to:
  /// **'Describe the problem and where exactly it is'**
  String get descriptionHint;

  /// No description provided for @descriptionRequired.
  ///
  /// In en, this message translates to:
  /// **'Please describe the problem'**
  String get descriptionRequired;

  /// No description provided for @descriptionTooShort.
  ///
  /// In en, this message translates to:
  /// **'Please add at least 10 characters'**
  String get descriptionTooShort;

  /// No description provided for @locationLabel.
  ///
  /// In en, this message translates to:
  /// **'Location'**
  String get locationLabel;

  /// No description provided for @pickOnMap.
  ///
  /// In en, this message translates to:
  /// **'Pick on map'**
  String get pickOnMap;

  /// No description provided for @locationNotSet.
  ///
  /// In en, this message translates to:
  /// **'No location selected'**
  String get locationNotSet;

  /// No description provided for @locationRequired.
  ///
  /// In en, this message translates to:
  /// **'Please choose a location'**
  String get locationRequired;

  /// No description provided for @addPhoto.
  ///
  /// In en, this message translates to:
  /// **'Add photo'**
  String get addPhoto;

  /// No description provided for @photoAttached.
  ///
  /// In en, this message translates to:
  /// **'Photo attached'**
  String get photoAttached;

  /// No description provided for @removePhoto.
  ///
  /// In en, this message translates to:
  /// **'Remove photo'**
  String get removePhoto;

  /// No description provided for @photoDemoNote.
  ///
  /// In en, this message translates to:
  /// **'Photo upload is simulated in demo mode.'**
  String get photoDemoNote;

  /// No description provided for @submitReport.
  ///
  /// In en, this message translates to:
  /// **'Submit report'**
  String get submitReport;

  /// No description provided for @reportSubmitted.
  ///
  /// In en, this message translates to:
  /// **'Report submitted. Thank you!'**
  String get reportSubmitted;

  /// No description provided for @noReportsTitle.
  ///
  /// In en, this message translates to:
  /// **'No reports yet'**
  String get noReportsTitle;

  /// No description provided for @noReportsMessage.
  ///
  /// In en, this message translates to:
  /// **'Spotted a problem in your neighborhood? Tap + to report it.'**
  String get noReportsMessage;

  /// No description provided for @reportDetails.
  ///
  /// In en, this message translates to:
  /// **'Report details'**
  String get reportDetails;

  /// No description provided for @statusLabel.
  ///
  /// In en, this message translates to:
  /// **'Status'**
  String get statusLabel;

  /// No description provided for @statusSubmitted.
  ///
  /// In en, this message translates to:
  /// **'Submitted'**
  String get statusSubmitted;

  /// No description provided for @statusInReview.
  ///
  /// In en, this message translates to:
  /// **'In review'**
  String get statusInReview;

  /// No description provided for @statusInProgress.
  ///
  /// In en, this message translates to:
  /// **'In progress'**
  String get statusInProgress;

  /// No description provided for @statusResolved.
  ///
  /// In en, this message translates to:
  /// **'Resolved'**
  String get statusResolved;

  /// No description provided for @priorityLabel.
  ///
  /// In en, this message translates to:
  /// **'Priority'**
  String get priorityLabel;

  /// No description provided for @priorityLow.
  ///
  /// In en, this message translates to:
  /// **'Low'**
  String get priorityLow;

  /// No description provided for @priorityMedium.
  ///
  /// In en, this message translates to:
  /// **'Medium'**
  String get priorityMedium;

  /// No description provided for @priorityHigh.
  ///
  /// In en, this message translates to:
  /// **'High'**
  String get priorityHigh;

  /// No description provided for @priorityCritical.
  ///
  /// In en, this message translates to:
  /// **'Critical'**
  String get priorityCritical;

  /// No description provided for @reportedOn.
  ///
  /// In en, this message translates to:
  /// **'Reported {date}'**
  String reportedOn(String date);

  /// No description provided for @neighborhoodLabel.
  ///
  /// In en, this message translates to:
  /// **'Neighborhood'**
  String get neighborhoodLabel;

  /// No description provided for @progressLabel.
  ///
  /// In en, this message translates to:
  /// **'Progress'**
  String get progressLabel;

  /// No description provided for @municipalityNotes.
  ///
  /// In en, this message translates to:
  /// **'Updates from the municipality'**
  String get municipalityNotes;

  /// No description provided for @noNotes.
  ///
  /// In en, this message translates to:
  /// **'No updates yet'**
  String get noNotes;

  /// No description provided for @pickLocationTitle.
  ///
  /// In en, this message translates to:
  /// **'Choose location'**
  String get pickLocationTitle;

  /// No description provided for @tapToPlace.
  ///
  /// In en, this message translates to:
  /// **'Tap the map to place the pin'**
  String get tapToPlace;

  /// No description provided for @confirmLocation.
  ///
  /// In en, this message translates to:
  /// **'Confirm location'**
  String get confirmLocation;

  /// No description provided for @photoLabel.
  ///
  /// In en, this message translates to:
  /// **'Photo'**
  String get photoLabel;

  /// No description provided for @manageReports.
  ///
  /// In en, this message translates to:
  /// **'Manage reports'**
  String get manageReports;

  /// No description provided for @filterStatus.
  ///
  /// In en, this message translates to:
  /// **'Status'**
  String get filterStatus;

  /// No description provided for @filterCategory.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get filterCategory;

  /// No description provided for @filterPriority.
  ///
  /// In en, this message translates to:
  /// **'Priority'**
  String get filterPriority;

  /// No description provided for @filterNeighborhood.
  ///
  /// In en, this message translates to:
  /// **'Neighborhood'**
  String get filterNeighborhood;

  /// No description provided for @sortNewest.
  ///
  /// In en, this message translates to:
  /// **'Newest first'**
  String get sortNewest;

  /// No description provided for @sortPriority.
  ///
  /// In en, this message translates to:
  /// **'Highest priority'**
  String get sortPriority;

  /// No description provided for @assignTo.
  ///
  /// In en, this message translates to:
  /// **'Assign to'**
  String get assignTo;

  /// No description provided for @assigneeLabel.
  ///
  /// In en, this message translates to:
  /// **'Assignee'**
  String get assigneeLabel;

  /// No description provided for @unassigned.
  ///
  /// In en, this message translates to:
  /// **'Unassigned'**
  String get unassigned;

  /// No description provided for @assignedTo.
  ///
  /// In en, this message translates to:
  /// **'Assigned to {name}'**
  String assignedTo(String name);

  /// No description provided for @changeStatus.
  ///
  /// In en, this message translates to:
  /// **'Change status'**
  String get changeStatus;

  /// No description provided for @noStatusChanges.
  ///
  /// In en, this message translates to:
  /// **'No further status changes available'**
  String get noStatusChanges;

  /// No description provided for @notesLabel.
  ///
  /// In en, this message translates to:
  /// **'Notes'**
  String get notesLabel;

  /// No description provided for @addNote.
  ///
  /// In en, this message translates to:
  /// **'Add note'**
  String get addNote;

  /// No description provided for @noteHint.
  ///
  /// In en, this message translates to:
  /// **'Write a note for the team and the citizen…'**
  String get noteHint;

  /// No description provided for @noteAdded.
  ///
  /// In en, this message translates to:
  /// **'Note added'**
  String get noteAdded;

  /// No description provided for @reportUpdated.
  ///
  /// In en, this message translates to:
  /// **'Report updated'**
  String get reportUpdated;

  /// No description provided for @invalidTransition.
  ///
  /// In en, this message translates to:
  /// **'This status change is not allowed'**
  String get invalidTransition;

  /// No description provided for @noMatchingTitle.
  ///
  /// In en, this message translates to:
  /// **'No matching reports'**
  String get noMatchingTitle;

  /// No description provided for @noMatchingMessage.
  ///
  /// In en, this message translates to:
  /// **'Try changing or clearing the filters.'**
  String get noMatchingMessage;

  /// No description provided for @reportsCount.
  ///
  /// In en, this message translates to:
  /// **'{count} reports'**
  String reportsCount(int count);

  /// No description provided for @createdLabel.
  ///
  /// In en, this message translates to:
  /// **'Created'**
  String get createdLabel;

  /// No description provided for @departmentRoads.
  ///
  /// In en, this message translates to:
  /// **'Roads'**
  String get departmentRoads;

  /// No description provided for @departmentLighting.
  ///
  /// In en, this message translates to:
  /// **'Lighting'**
  String get departmentLighting;

  /// No description provided for @departmentSanitation.
  ///
  /// In en, this message translates to:
  /// **'Sanitation'**
  String get departmentSanitation;

  /// No description provided for @departmentPublicSpaces.
  ///
  /// In en, this message translates to:
  /// **'Public spaces'**
  String get departmentPublicSpaces;

  /// No description provided for @cityMapTitle.
  ///
  /// In en, this message translates to:
  /// **'City map'**
  String get cityMapTitle;

  /// No description provided for @layersLabel.
  ///
  /// In en, this message translates to:
  /// **'Layers'**
  String get layersLabel;

  /// No description provided for @layerParking.
  ///
  /// In en, this message translates to:
  /// **'Parking'**
  String get layerParking;

  /// No description provided for @layerReports.
  ///
  /// In en, this message translates to:
  /// **'Reports'**
  String get layerReports;

  /// No description provided for @availabilityHigh.
  ///
  /// In en, this message translates to:
  /// **'Plenty of space'**
  String get availabilityHigh;

  /// No description provided for @availabilityMedium.
  ///
  /// In en, this message translates to:
  /// **'Limited'**
  String get availabilityMedium;

  /// No description provided for @availabilityLow.
  ///
  /// In en, this message translates to:
  /// **'Almost full'**
  String get availabilityLow;

  /// No description provided for @availabilityNone.
  ///
  /// In en, this message translates to:
  /// **'Full'**
  String get availabilityNone;

  /// No description provided for @mapAttribution.
  ///
  /// In en, this message translates to:
  /// **'OpenStreetMap contributors'**
  String get mapAttribution;

  /// No description provided for @clusterZoomHint.
  ///
  /// In en, this message translates to:
  /// **'{count} items here. Zoom in to see them.'**
  String clusterZoomHint(int count);

  /// No description provided for @dashboardTitle.
  ///
  /// In en, this message translates to:
  /// **'City dashboard'**
  String get dashboardTitle;

  /// No description provided for @greeting.
  ///
  /// In en, this message translates to:
  /// **'Hello, {name}'**
  String greeting(String name);

  /// No description provided for @kpiOpenReports.
  ///
  /// In en, this message translates to:
  /// **'Open reports'**
  String get kpiOpenReports;

  /// No description provided for @kpiAvgResolution.
  ///
  /// In en, this message translates to:
  /// **'Avg. resolution'**
  String get kpiAvgResolution;

  /// No description provided for @kpiOccupancy.
  ///
  /// In en, this message translates to:
  /// **'Parking occupancy'**
  String get kpiOccupancy;

  /// No description provided for @kpiRevenue.
  ///
  /// In en, this message translates to:
  /// **'Revenue today'**
  String get kpiRevenue;

  /// No description provided for @valueHours.
  ///
  /// In en, this message translates to:
  /// **'{value} h'**
  String valueHours(String value);

  /// No description provided for @valueDays.
  ///
  /// In en, this message translates to:
  /// **'{value} days'**
  String valueDays(String value);

  /// No description provided for @notAvailable.
  ///
  /// In en, this message translates to:
  /// **'n/a'**
  String get notAvailable;

  /// No description provided for @chartByCategory.
  ///
  /// In en, this message translates to:
  /// **'Reports by category'**
  String get chartByCategory;

  /// No description provided for @chartOverTime.
  ///
  /// In en, this message translates to:
  /// **'Reports over the last 14 days'**
  String get chartOverTime;

  /// No description provided for @chartOccupancyByHour.
  ///
  /// In en, this message translates to:
  /// **'Parking occupancy by hour (%)'**
  String get chartOccupancyByHour;

  /// No description provided for @aiInsights.
  ///
  /// In en, this message translates to:
  /// **'AI insights'**
  String get aiInsights;

  /// No description provided for @noInsights.
  ///
  /// In en, this message translates to:
  /// **'No notable trends right now.'**
  String get noInsights;

  /// No description provided for @reportManagement.
  ///
  /// In en, this message translates to:
  /// **'Report management'**
  String get reportManagement;

  /// No description provided for @viewAll.
  ///
  /// In en, this message translates to:
  /// **'View all'**
  String get viewAll;

  /// No description provided for @insightSpike.
  ///
  /// In en, this message translates to:
  /// **'{category} in {neighborhood} up {percent}% this week'**
  String insightSpike(String category, String neighborhood, int percent);

  /// No description provided for @insightDrop.
  ///
  /// In en, this message translates to:
  /// **'{category} reports down {percent}% city-wide this week'**
  String insightDrop(String category, int percent);

  /// No description provided for @insightHotspot.
  ///
  /// In en, this message translates to:
  /// **'{neighborhood} has the most open reports ({count})'**
  String insightHotspot(String neighborhood, int count);

  /// No description provided for @insightUnassigned.
  ///
  /// In en, this message translates to:
  /// **'{count} high-priority reports are still unassigned'**
  String insightUnassigned(int count);

  /// No description provided for @insightSlowResolution.
  ///
  /// In en, this message translates to:
  /// **'{category}: {days} days to resolve on average'**
  String insightSlowResolution(String category, String days);

  /// No description provided for @insightPeakOccupancy.
  ///
  /// In en, this message translates to:
  /// **'Parking demand peaks around {hour} at {percent}%'**
  String insightPeakOccupancy(String hour, int percent);

  /// No description provided for @insightFullParking.
  ///
  /// In en, this message translates to:
  /// **'{count} parking facilities are over 90% full'**
  String insightFullParking(int count);

  /// No description provided for @assistantTitle.
  ///
  /// In en, this message translates to:
  /// **'City assistant'**
  String get assistantTitle;

  /// No description provided for @assistantSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Parking, traffic and city services'**
  String get assistantSubtitle;

  /// No description provided for @assistantWelcome.
  ///
  /// In en, this message translates to:
  /// **'Hi! I\'m your UrbanFlow assistant. Ask me about parking, traffic or city services.'**
  String get assistantWelcome;

  /// No description provided for @messageHint.
  ///
  /// In en, this message translates to:
  /// **'Ask me anything about the city…'**
  String get messageHint;

  /// No description provided for @assistantTyping.
  ///
  /// In en, this message translates to:
  /// **'Assistant is typing…'**
  String get assistantTyping;

  /// No description provided for @clearChat.
  ///
  /// In en, this message translates to:
  /// **'Clear chat'**
  String get clearChat;

  /// No description provided for @qrFindParking.
  ///
  /// In en, this message translates to:
  /// **'Find parking near me'**
  String get qrFindParking;

  /// No description provided for @qrParkingPrice.
  ///
  /// In en, this message translates to:
  /// **'Parking prices'**
  String get qrParkingPrice;

  /// No description provided for @qrTraffic.
  ///
  /// In en, this message translates to:
  /// **'Traffic right now'**
  String get qrTraffic;

  /// No description provided for @qrReportIssue.
  ///
  /// In en, this message translates to:
  /// **'How do I report an issue?'**
  String get qrReportIssue;

  /// No description provided for @qrMyReports.
  ///
  /// In en, this message translates to:
  /// **'Status of my reports'**
  String get qrMyReports;

  /// No description provided for @qrCityHours.
  ///
  /// In en, this message translates to:
  /// **'City office hours'**
  String get qrCityHours;

  /// No description provided for @qrEmergency.
  ///
  /// In en, this message translates to:
  /// **'Emergency numbers'**
  String get qrEmergency;

  /// No description provided for @aiGreeting.
  ///
  /// In en, this message translates to:
  /// **'Hello! How can I help you today?'**
  String get aiGreeting;

  /// No description provided for @aiThanks.
  ///
  /// In en, this message translates to:
  /// **'You\'re welcome! Anything else I can help with?'**
  String get aiThanks;

  /// No description provided for @aiFallback.
  ///
  /// In en, this message translates to:
  /// **'I\'m not sure I understood. I can help with parking, traffic, reports and city services.'**
  String get aiFallback;

  /// No description provided for @aiParkingBest.
  ///
  /// In en, this message translates to:
  /// **'Best option near you right now: {name}, {distance} away, {free} free spaces, {price}.'**
  String aiParkingBest(String name, String distance, int free, String price);

  /// No description provided for @aiParkingNone.
  ///
  /// In en, this message translates to:
  /// **'I couldn\'t find free parking nearby right now. Try again in a few minutes.'**
  String get aiParkingNone;

  /// No description provided for @aiParkingPrices.
  ///
  /// In en, this message translates to:
  /// **'Public parking in Skopje is priced by zone: Zone A {zoneA}, Zone B {zoneB}, Zone C {zoneC} per hour. Many mall garages are free.'**
  String aiParkingPrices(String zoneA, String zoneB, String zoneC);

  /// No description provided for @aiSessionActive.
  ///
  /// In en, this message translates to:
  /// **'Your session at {name} has {time} remaining.'**
  String aiSessionActive(String name, String time);

  /// No description provided for @aiSessionNone.
  ///
  /// In en, this message translates to:
  /// **'You don\'t have an active parking session.'**
  String get aiSessionNone;

  /// No description provided for @aiTrafficHeavy.
  ///
  /// In en, this message translates to:
  /// **'Traffic is heavy right now, especially on {streets}. Allow extra time.'**
  String aiTrafficHeavy(String streets);

  /// No description provided for @aiTrafficModerate.
  ///
  /// In en, this message translates to:
  /// **'Traffic is moderate. Expect some delays on {streets}.'**
  String aiTrafficModerate(String streets);

  /// No description provided for @aiTrafficLight.
  ///
  /// In en, this message translates to:
  /// **'Traffic is light across the city right now.'**
  String get aiTrafficLight;

  /// No description provided for @aiReportHowTo.
  ///
  /// In en, this message translates to:
  /// **'Open Reports, tap +, choose a category, describe the problem and pin the location on the map. You can follow its status in My reports.'**
  String get aiReportHowTo;

  /// No description provided for @aiReportStatus.
  ///
  /// In en, this message translates to:
  /// **'You have {total} reports: {open} open and {resolved} resolved.'**
  String aiReportStatus(int total, int open, int resolved);

  /// No description provided for @aiReportStatusNone.
  ///
  /// In en, this message translates to:
  /// **'You haven\'t submitted any reports yet.'**
  String get aiReportStatusNone;

  /// No description provided for @aiCityHours.
  ///
  /// In en, this message translates to:
  /// **'City of Skopje offices are open Monday to Friday, 08:00 to 16:00. Many services are also available online.'**
  String get aiCityHours;

  /// No description provided for @aiEmergency.
  ///
  /// In en, this message translates to:
  /// **'Emergency numbers in North Macedonia: 112 general emergency, 192 police, 193 fire department, 194 ambulance.'**
  String get aiEmergency;

  /// No description provided for @aiTransport.
  ///
  /// In en, this message translates to:
  /// **'City buses run from about 05:00 to 23:00. Main hubs are the Transport Center and the city center stops.'**
  String get aiTransport;

  /// No description provided for @aiWaste.
  ///
  /// In en, this message translates to:
  /// **'Waste is collected daily in central areas and two to three times a week elsewhere. Report overflowing bins in Reports.'**
  String get aiWaste;

  /// No description provided for @settingsTitle.
  ///
  /// In en, this message translates to:
  /// **'Profile & settings'**
  String get settingsTitle;

  /// No description provided for @signedInAs.
  ///
  /// In en, this message translates to:
  /// **'Signed in as'**
  String get signedInAs;

  /// No description provided for @appearance.
  ///
  /// In en, this message translates to:
  /// **'Appearance'**
  String get appearance;

  /// No description provided for @themeSystem.
  ///
  /// In en, this message translates to:
  /// **'System'**
  String get themeSystem;

  /// No description provided for @themeLight.
  ///
  /// In en, this message translates to:
  /// **'Light'**
  String get themeLight;

  /// No description provided for @themeDark.
  ///
  /// In en, this message translates to:
  /// **'Dark'**
  String get themeDark;

  /// No description provided for @languageLabel.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get languageLabel;

  /// No description provided for @aboutLabel.
  ///
  /// In en, this message translates to:
  /// **'About'**
  String get aboutLabel;

  /// No description provided for @aboutText.
  ///
  /// In en, this message translates to:
  /// **'UrbanFlow AI helps citizens and the municipality of Skopje keep the city moving.'**
  String get aboutText;

  /// No description provided for @versionLabel.
  ///
  /// In en, this message translates to:
  /// **'Version {version}'**
  String versionLabel(String version);

  /// No description provided for @langEnglish.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get langEnglish;

  /// No description provided for @langAlbanian.
  ///
  /// In en, this message translates to:
  /// **'Shqip'**
  String get langAlbanian;

  /// No description provided for @langMacedonian.
  ///
  /// In en, this message translates to:
  /// **'Македонски'**
  String get langMacedonian;

  /// No description provided for @langTurkish.
  ///
  /// In en, this message translates to:
  /// **'Türkçe'**
  String get langTurkish;

  /// No description provided for @scoreLabel.
  ///
  /// In en, this message translates to:
  /// **'Score'**
  String get scoreLabel;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'mk', 'sq', 'tr'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'mk':
      return AppLocalizationsMk();
    case 'sq':
      return AppLocalizationsSq();
    case 'tr':
      return AppLocalizationsTr();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
