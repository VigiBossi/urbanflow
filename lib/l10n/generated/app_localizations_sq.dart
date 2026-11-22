// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Albanian (`sq`).
class AppLocalizationsSq extends AppLocalizations {
  AppLocalizationsSq([String locale = 'sq']) : super(locale);

  @override
  String get appName => 'UrbanFlow AI';

  @override
  String get appTagline => 'Shërbime të qytetit të mençur për Shkupin';

  @override
  String get retry => 'Provo përsëri';

  @override
  String get cancel => 'Anulo';

  @override
  String get confirm => 'Konfirmo';

  @override
  String get save => 'Ruaj';

  @override
  String get close => 'Mbyll';

  @override
  String get ok => 'Në rregull';

  @override
  String get send => 'Dërgo';

  @override
  String get all => 'Të gjitha';

  @override
  String get clearFilters => 'Pastro filtrat';

  @override
  String get loading => 'Duke u ngarkuar…';

  @override
  String get errorTitle => 'Diçka shkoi keq';

  @override
  String get errorMessage =>
      'Nuk mundëm t\'i ngarkojmë të dhënat. Kontrolloni lidhjen dhe provoni përsëri.';

  @override
  String get timeJustNow => 'tani';

  @override
  String timeMinutesAgo(int count) {
    return 'para $count min';
  }

  @override
  String timeHoursAgo(int count) {
    return 'para $count orësh';
  }

  @override
  String timeDaysAgo(int count) {
    return 'para $count ditësh';
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
    return '$count orë';
  }

  @override
  String durationMinutes(int count) {
    return '$count min';
  }

  @override
  String durationHoursMinutes(int hours, int minutes) {
    return '$hours orë $minutes min';
  }

  @override
  String get loginTitle => 'Mirë se vini përsëri';

  @override
  String get loginSubtitle => 'Hyni për të vazhduar';

  @override
  String get emailLabel => 'Email';

  @override
  String get passwordLabel => 'Fjalëkalimi';

  @override
  String get emailRequired => 'Ju lutemi shkruani email-in';

  @override
  String get emailInvalid => 'Ju lutemi shkruani një email të vlefshëm';

  @override
  String get passwordRequired => 'Ju lutemi shkruani fjalëkalimin';

  @override
  String get passwordTooShort =>
      'Fjalëkalimi duhet të ketë të paktën 6 karaktere';

  @override
  String get signIn => 'Hyr';

  @override
  String get showPassword => 'Shfaq fjalëkalimin';

  @override
  String get hidePassword => 'Fshih fjalëkalimin';

  @override
  String get invalidCredentials => 'Email ose fjalëkalim i pasaktë';

  @override
  String get networkError => 'Gabim në rrjet. Ju lutemi provoni përsëri.';

  @override
  String get demoAccounts => 'Llogari demo';

  @override
  String get demoAccountsHint =>
      'Prekni një llogari për të plotësuar formularin';

  @override
  String get roleCitizen => 'Qytetar';

  @override
  String get roleMunicipality => 'Komuna';

  @override
  String get logout => 'Dil';

  @override
  String get logoutConfirmTitle => 'Të dilni?';

  @override
  String get logoutConfirmMessage =>
      'Do t\'ju duhet të hyni përsëri për të përdorur aplikacionin.';

  @override
  String get navParking => 'Parkimi';

  @override
  String get navMap => 'Harta';

  @override
  String get navReports => 'Raportet';

  @override
  String get navAssistant => 'Asistenti';

  @override
  String get navProfile => 'Profili';

  @override
  String get navDashboard => 'Paneli';

  @override
  String get navManage => 'Menaxho';

  @override
  String get locationFallback =>
      'Vendndodhja nuk është e disponueshme. Po shfaqen rezultate rreth qendrës së Shkupit.';

  @override
  String get locationEnable => 'Aktivizo';

  @override
  String get useMyLocation => 'Përdor vendndodhjen time';

  @override
  String get locating => 'Po gjejmë vendndodhjen tuaj…';

  @override
  String get parkingTitle => 'Parkim AI';

  @override
  String get parkingSubtitle => 'Renditur për ju tani';

  @override
  String get rankingPreference => 'Preferenca e renditjes';

  @override
  String get presetBalanced => 'I balancuar';

  @override
  String get presetClosest => 'Më i afërti';

  @override
  String get presetCheapest => 'Më i liri';

  @override
  String get presetAvailable => 'Më shumë vende';

  @override
  String get listView => 'Lista';

  @override
  String get mapView => 'Harta';

  @override
  String spotsFree(int available, int capacity) {
    return '$available/$capacity të lira';
  }

  @override
  String get spotFull => 'Plot';

  @override
  String get priceFree => 'Falas';

  @override
  String pricePerHour(String price) {
    return '$price/orë';
  }

  @override
  String scoreValue(int value) {
    return 'Pikët $value';
  }

  @override
  String get topPick => 'Zgjedhja më e mirë';

  @override
  String get whyThisSpot => 'Pse ky vend?';

  @override
  String get factorDistance => 'Distanca';

  @override
  String get factorAvailability => 'Disponueshmëria';

  @override
  String get factorPrice => 'Çmimi';

  @override
  String get factorDemand => 'Kërkesa në këtë orë';

  @override
  String get scoreExplanation =>
      'Pikët kombinojnë distancën nga ju, vendet e lira, çmimin dhe kërkesën e pritur për këtë kohë të ditës.';

  @override
  String get parkingTypeStreet => 'Rrugë';

  @override
  String get parkingTypeGarage => 'Garazh';

  @override
  String get parkingTypeLot => 'Parking i hapur';

  @override
  String zoneLabel(String zone) {
    return 'Zona $zone';
  }

  @override
  String get payAndPark => 'Paguaj dhe parko';

  @override
  String get noSpotsTitle => 'Nuk u gjet parking';

  @override
  String get noSpotsMessage => 'Nuk ka vende parkimi për t\'u shfaqur tani.';

  @override
  String lastUpdated(String time) {
    return 'Përditësuar $time';
  }

  @override
  String get paymentTitle => 'Paguaj parkimin';

  @override
  String get selectDuration => 'Kohëzgjatja';

  @override
  String get plateLabel => 'Targa';

  @override
  String get plateHint => 'SK 1234 AB';

  @override
  String get plateRequired => 'Ju lutemi shkruani targën';

  @override
  String get plateInvalid => 'Përdorni 4–10 shkronja dhe shifra';

  @override
  String get paymentMethod => 'Mënyra e pagesës';

  @override
  String get paymentCard => 'Kartë •••• 4242';

  @override
  String get paymentWallet => 'Portofol celular';

  @override
  String get paymentSms => 'Parkim me SMS';

  @override
  String get totalLabel => 'Totali';

  @override
  String payAmount(String amount) {
    return 'Paguaj $amount';
  }

  @override
  String get startFreeSession => 'Fillo seancën';

  @override
  String get mockPaymentNotice =>
      'Modaliteti demo: nuk bëhet pagesë e vërtetë.';

  @override
  String get paymentSuccess => 'Pagesa u krye me sukses. Seanca juaj filloi.';

  @override
  String get spotFullError =>
      'Ky parking është plot. Ju lutemi zgjidhni një tjetër.';

  @override
  String get replaceSessionWarning =>
      'Fillimi i një seance të re do të përfundojë seancën aktuale.';

  @override
  String get activeSessionTitle => 'Seanca e parkimit';

  @override
  String get timeRemaining => 'Koha e mbetur';

  @override
  String endsAt(String time) {
    return 'Përfundon në $time';
  }

  @override
  String get extend => 'Zgjat';

  @override
  String get endSession => 'Përfundo seancën';

  @override
  String get endSessionConfirm =>
      'Të përfundojë seanca e parkimit tani? Koha e papërdorur nuk rimbursohet.';

  @override
  String get extendTitle => 'Zgjat seancën';

  @override
  String extendOption(String duration, String amount) {
    return 'Shto $duration · $amount';
  }

  @override
  String get sessionExtended => 'Seanca u zgjat';

  @override
  String get sessionEnded => 'Seanca e parkimit përfundoi';

  @override
  String get sessionExpiredTitle => 'Parkimi skadoi';

  @override
  String sessionExpiredMessage(String spot) {
    return 'Seanca juaj te $spot ka skaduar. Lëvizni makinën ose filloni një seancë të re për të shmangur gjobën.';
  }

  @override
  String get sessionWarningTitle => 'Kanë mbetur 10 minuta';

  @override
  String sessionWarningMessage(String spot) {
    return 'Parkimi juaj te $spot skadon për më pak se 10 minuta.';
  }

  @override
  String sessionBanner(String spot, String time) {
    return 'Parkim te $spot · edhe $time';
  }

  @override
  String get viewSession => 'Shiko';

  @override
  String get noActiveSessionTitle => 'Nuk ka seancë aktive';

  @override
  String get noActiveSessionMessage =>
      'Zgjidhni një vend parkimi për të filluar një seancë.';

  @override
  String get amountPaid => 'Paguar';

  @override
  String get startedAt => 'Filloi';

  @override
  String get sessionExpiredBadge => 'Skaduar';

  @override
  String get myReports => 'Raportet e mia';

  @override
  String get newReport => 'Raport i ri';

  @override
  String get categoryLabel => 'Kategoria';

  @override
  String get categoryPothole => 'Gropë në rrugë';

  @override
  String get categoryStreetlight => 'Ndriçim i prishur';

  @override
  String get categoryGraffiti => 'Grafite';

  @override
  String get categoryTrash => 'Mbeturina';

  @override
  String get categoryDamagedSign => 'Shenjë e dëmtuar';

  @override
  String get categoryOther => 'Tjetër';

  @override
  String get descriptionLabel => 'Përshkrimi';

  @override
  String get descriptionHint =>
      'Përshkruani problemin dhe ku saktësisht ndodhet';

  @override
  String get descriptionRequired => 'Ju lutemi përshkruani problemin';

  @override
  String get descriptionTooShort => 'Ju lutemi shtoni të paktën 10 karaktere';

  @override
  String get locationLabel => 'Vendndodhja';

  @override
  String get pickOnMap => 'Zgjidh në hartë';

  @override
  String get locationNotSet => 'Nuk është zgjedhur vendndodhja';

  @override
  String get locationRequired => 'Ju lutemi zgjidhni vendndodhjen';

  @override
  String get addPhoto => 'Shto foto';

  @override
  String get photoAttached => 'Foto e bashkëngjitur';

  @override
  String get removePhoto => 'Hiq foton';

  @override
  String get photoDemoNote => 'Ngarkimi i fotos simulohet në modalitetin demo.';

  @override
  String get submitReport => 'Dërgo raportin';

  @override
  String get reportSubmitted => 'Raporti u dërgua. Faleminderit!';

  @override
  String get noReportsTitle => 'Ende pa raporte';

  @override
  String get noReportsMessage =>
      'Keni vënë re një problem në lagjen tuaj? Prekni + për ta raportuar.';

  @override
  String get reportDetails => 'Detajet e raportit';

  @override
  String get statusLabel => 'Statusi';

  @override
  String get statusSubmitted => 'Dërguar';

  @override
  String get statusInReview => 'Në shqyrtim';

  @override
  String get statusInProgress => 'Në proces';

  @override
  String get statusResolved => 'Zgjidhur';

  @override
  String get priorityLabel => 'Prioriteti';

  @override
  String get priorityLow => 'I ulët';

  @override
  String get priorityMedium => 'Mesatar';

  @override
  String get priorityHigh => 'I lartë';

  @override
  String get priorityCritical => 'Kritik';

  @override
  String reportedOn(String date) {
    return 'Raportuar $date';
  }

  @override
  String get neighborhoodLabel => 'Lagjja';

  @override
  String get progressLabel => 'Ecuria';

  @override
  String get municipalityNotes => 'Përditësime nga komuna';

  @override
  String get noNotes => 'Ende pa përditësime';

  @override
  String get pickLocationTitle => 'Zgjidhni vendndodhjen';

  @override
  String get tapToPlace => 'Prekni hartën për të vendosur shenjën';

  @override
  String get confirmLocation => 'Konfirmo vendndodhjen';

  @override
  String get photoLabel => 'Foto';

  @override
  String get manageReports => 'Menaxho raportet';

  @override
  String get filterStatus => 'Statusi';

  @override
  String get filterCategory => 'Kategoria';

  @override
  String get filterPriority => 'Prioriteti';

  @override
  String get filterNeighborhood => 'Lagjja';

  @override
  String get sortNewest => 'Më të rejat';

  @override
  String get sortPriority => 'Prioriteti më i lartë';

  @override
  String get assignTo => 'Cakto te';

  @override
  String get assigneeLabel => 'I caktuari';

  @override
  String get unassigned => 'I pacaktuar';

  @override
  String assignedTo(String name) {
    return 'Caktuar te $name';
  }

  @override
  String get changeStatus => 'Ndrysho statusin';

  @override
  String get noStatusChanges => 'Nuk ka ndryshime të tjera të statusit';

  @override
  String get notesLabel => 'Shënime';

  @override
  String get addNote => 'Shto shënim';

  @override
  String get noteHint => 'Shkruani një shënim për ekipin dhe qytetarin…';

  @override
  String get noteAdded => 'Shënimi u shtua';

  @override
  String get reportUpdated => 'Raporti u përditësua';

  @override
  String get invalidTransition => 'Ky ndryshim statusi nuk lejohet';

  @override
  String get noMatchingTitle => 'Nuk ka raporte që përputhen';

  @override
  String get noMatchingMessage => 'Provoni të ndryshoni ose pastroni filtrat.';

  @override
  String reportsCount(int count) {
    return '$count raporte';
  }

  @override
  String get createdLabel => 'Krijuar';

  @override
  String get departmentRoads => 'Rrugët';

  @override
  String get departmentLighting => 'Ndriçimi';

  @override
  String get departmentSanitation => 'Higjiena';

  @override
  String get departmentPublicSpaces => 'Hapësirat publike';

  @override
  String get cityMapTitle => 'Harta e qytetit';

  @override
  String get layersLabel => 'Shtresat';

  @override
  String get layerParking => 'Parkimi';

  @override
  String get layerReports => 'Raportet';

  @override
  String get availabilityHigh => 'Shumë vende';

  @override
  String get availabilityMedium => 'E kufizuar';

  @override
  String get availabilityLow => 'Pothuajse plot';

  @override
  String get availabilityNone => 'Plot';

  @override
  String get mapAttribution => 'Kontribuuesit e OpenStreetMap';

  @override
  String clusterZoomHint(int count) {
    return '$count elemente këtu. Zmadhoni për t\'i parë.';
  }

  @override
  String get dashboardTitle => 'Paneli i qytetit';

  @override
  String greeting(String name) {
    return 'Përshëndetje, $name';
  }

  @override
  String get kpiOpenReports => 'Raporte të hapura';

  @override
  String get kpiAvgResolution => 'Zgjidhja mesatare';

  @override
  String get kpiOccupancy => 'Zënia e parkimit';

  @override
  String get kpiRevenue => 'Të ardhurat sot';

  @override
  String valueHours(String value) {
    return '$value orë';
  }

  @override
  String valueDays(String value) {
    return '$value ditë';
  }

  @override
  String get notAvailable => 's/d';

  @override
  String get chartByCategory => 'Raportet sipas kategorisë';

  @override
  String get chartOverTime => 'Raportet në 14 ditët e fundit';

  @override
  String get chartOccupancyByHour => 'Zënia e parkimit sipas orës (%)';

  @override
  String get aiInsights => 'Analiza AI';

  @override
  String get noInsights => 'Nuk ka tendenca të veçanta tani.';

  @override
  String get reportManagement => 'Menaxhimi i raporteve';

  @override
  String get viewAll => 'Shiko të gjitha';

  @override
  String insightSpike(String category, String neighborhood, int percent) {
    return '$category në $neighborhood u rritën $percent% këtë javë';
  }

  @override
  String insightDrop(String category, int percent) {
    return 'Raportet për $category ranë $percent% në gjithë qytetin këtë javë';
  }

  @override
  String insightHotspot(String neighborhood, int count) {
    return '$neighborhood ka më shumë raporte të hapura ($count)';
  }

  @override
  String insightUnassigned(int count) {
    return '$count raporte me prioritet të lartë ende nuk janë caktuar';
  }

  @override
  String insightSlowResolution(String category, String days) {
    return '$category: mesatarisht $days ditë për zgjidhje';
  }

  @override
  String insightPeakOccupancy(String hour, int percent) {
    return 'Kërkesa për parkim arrin kulmin rreth orës $hour me $percent%';
  }

  @override
  String insightFullParking(int count) {
    return '$count parkingje janë mbi 90% plot';
  }

  @override
  String get assistantTitle => 'Asistenti i qytetit';

  @override
  String get assistantSubtitle => 'Parkimi, trafiku dhe shërbimet e qytetit';

  @override
  String get assistantWelcome =>
      'Përshëndetje! Jam asistenti juaj UrbanFlow. Më pyesni për parkimin, trafikun ose shërbimet e qytetit.';

  @override
  String get messageHint => 'Më pyesni çdo gjë për qytetin…';

  @override
  String get assistantTyping => 'Asistenti po shkruan…';

  @override
  String get clearChat => 'Pastro bisedën';

  @override
  String get qrFindParking => 'Gjej parking afër meje';

  @override
  String get qrParkingPrice => 'Çmimet e parkimit';

  @override
  String get qrTraffic => 'Trafiku tani';

  @override
  String get qrReportIssue => 'Si të raportoj një problem?';

  @override
  String get qrMyReports => 'Statusi i raporteve të mia';

  @override
  String get qrCityHours => 'Orari i zyrave të qytetit';

  @override
  String get qrEmergency => 'Numrat e urgjencës';

  @override
  String get aiGreeting => 'Përshëndetje! Si mund t\'ju ndihmoj sot?';

  @override
  String get aiThanks => 'S\'ka përse! A mund t\'ju ndihmoj me diçka tjetër?';

  @override
  String get aiFallback =>
      'Nuk jam i sigurt që kuptova. Mund t\'ju ndihmoj me parkimin, trafikun, raportet dhe shërbimet e qytetit.';

  @override
  String aiParkingBest(String name, String distance, int free, String price) {
    return 'Opsioni më i mirë afër jush tani: $name, $distance larg, $free vende të lira, $price.';
  }

  @override
  String get aiParkingNone =>
      'Nuk gjeta parking të lirë afër tani. Provoni përsëri pas pak minutash.';

  @override
  String aiParkingPrices(String zoneA, String zoneB, String zoneC) {
    return 'Parkimi publik në Shkup paguhet sipas zonës: Zona A $zoneA, Zona B $zoneB, Zona C $zoneC në orë. Shumë garazhe të qendrave tregtare janë falas.';
  }

  @override
  String aiSessionActive(String name, String time) {
    return 'Seancës suaj te $name i kanë mbetur $time.';
  }

  @override
  String get aiSessionNone => 'Nuk keni seancë aktive parkimi.';

  @override
  String aiTrafficHeavy(String streets) {
    return 'Trafiku është i rënduar tani, veçanërisht në $streets. Llogaritni kohë shtesë.';
  }

  @override
  String aiTrafficModerate(String streets) {
    return 'Trafiku është mesatar. Prisni vonesa në $streets.';
  }

  @override
  String get aiTrafficLight => 'Trafiku është i lehtë në gjithë qytetin tani.';

  @override
  String get aiReportHowTo =>
      'Hapni Raportet, prekni +, zgjidhni kategorinë, përshkruani problemin dhe shënoni vendndodhjen në hartë. Statusin mund ta ndiqni te Raportet e mia.';

  @override
  String aiReportStatus(int total, int open, int resolved) {
    return 'Keni $total raporte: $open të hapura dhe $resolved të zgjidhura.';
  }

  @override
  String get aiReportStatusNone => 'Ende nuk keni dërguar asnjë raport.';

  @override
  String get aiCityHours =>
      'Zyrat e Qytetit të Shkupit punojnë nga e hëna deri të premten, 08:00 deri 16:00. Shumë shërbime janë edhe online.';

  @override
  String get aiEmergency =>
      'Numrat e urgjencës në Maqedoninë e Veriut: 112 urgjenca e përgjithshme, 192 policia, 193 zjarrfikësit, 194 ndihma e shpejtë.';

  @override
  String get aiTransport =>
      'Autobusët e qytetit qarkullojnë nga ora 05:00 deri 23:00. Pikat kryesore janë Qendra e Transportit dhe stacionet në qendër.';

  @override
  String get aiWaste =>
      'Mbeturinat mblidhen çdo ditë në zonat qendrore dhe dy deri tre herë në javë në zonat e tjera. Raportoni kontejnerët e mbushur te Raportet.';

  @override
  String get settingsTitle => 'Profili dhe cilësimet';

  @override
  String get signedInAs => 'Hyrë si';

  @override
  String get appearance => 'Pamja';

  @override
  String get themeSystem => 'Sistemi';

  @override
  String get themeLight => 'E çelët';

  @override
  String get themeDark => 'E errët';

  @override
  String get languageLabel => 'Gjuha';

  @override
  String get aboutLabel => 'Rreth nesh';

  @override
  String get aboutText =>
      'UrbanFlow AI ndihmon qytetarët dhe komunën e Shkupit ta mbajnë qytetin në lëvizje.';

  @override
  String versionLabel(String version) {
    return 'Versioni $version';
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
  String get scoreLabel => 'Pikët';
}
