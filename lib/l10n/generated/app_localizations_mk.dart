// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Macedonian (`mk`).
class AppLocalizationsMk extends AppLocalizations {
  AppLocalizationsMk([String locale = 'mk']) : super(locale);

  @override
  String get appName => 'UrbanFlow AI';

  @override
  String get appTagline => 'Паметни градски услуги за Скопје';

  @override
  String get retry => 'Обиди се повторно';

  @override
  String get cancel => 'Откажи';

  @override
  String get confirm => 'Потврди';

  @override
  String get save => 'Зачувај';

  @override
  String get close => 'Затвори';

  @override
  String get ok => 'Во ред';

  @override
  String get send => 'Испрати';

  @override
  String get all => 'Сите';

  @override
  String get clearFilters => 'Исчисти филтри';

  @override
  String get loading => 'Се вчитува…';

  @override
  String get errorTitle => 'Нешто тргна наопаку';

  @override
  String get errorMessage =>
      'Не успеавме да ги вчитаме податоците. Проверете ја врската и обидете се повторно.';

  @override
  String get timeJustNow => 'сега';

  @override
  String timeMinutesAgo(int count) {
    return 'пред $count мин';
  }

  @override
  String timeHoursAgo(int count) {
    return 'пред $count ч';
  }

  @override
  String timeDaysAgo(int count) {
    return 'пред $count дена';
  }

  @override
  String currencyAmount(String amount) {
    return '$amount ден.';
  }

  @override
  String distanceMeters(String value) {
    return '$value м';
  }

  @override
  String distanceKilometers(String value) {
    return '$value км';
  }

  @override
  String durationHours(int count) {
    return '$count ч';
  }

  @override
  String durationMinutes(int count) {
    return '$count мин';
  }

  @override
  String durationHoursMinutes(int hours, int minutes) {
    return '$hours ч $minutes мин';
  }

  @override
  String get loginTitle => 'Добредојдовте назад';

  @override
  String get loginSubtitle => 'Најавете се за да продолжите';

  @override
  String get emailLabel => 'Е-пошта';

  @override
  String get passwordLabel => 'Лозинка';

  @override
  String get emailRequired => 'Внесете ја вашата е-пошта';

  @override
  String get emailInvalid => 'Внесете валидна адреса за е-пошта';

  @override
  String get passwordRequired => 'Внесете ја лозинката';

  @override
  String get passwordTooShort => 'Лозинката мора да има најмалку 6 знаци';

  @override
  String get signIn => 'Најави се';

  @override
  String get showPassword => 'Прикажи лозинка';

  @override
  String get hidePassword => 'Скриј лозинка';

  @override
  String get invalidCredentials => 'Погрешна е-пошта или лозинка';

  @override
  String get networkError => 'Мрежна грешка. Обидете се повторно.';

  @override
  String get demoAccounts => 'Демо сметки';

  @override
  String get demoAccountsHint => 'Допрете сметка за да се пополни формуларот';

  @override
  String get roleCitizen => 'Граѓанин';

  @override
  String get roleMunicipality => 'Општина';

  @override
  String get logout => 'Одјави се';

  @override
  String get logoutConfirmTitle => 'Одјава?';

  @override
  String get logoutConfirmMessage =>
      'Ќе треба повторно да се најавите за да ја користите апликацијата.';

  @override
  String get navParking => 'Паркинг';

  @override
  String get navMap => 'Мапа';

  @override
  String get navReports => 'Пријави';

  @override
  String get navAssistant => 'Асистент';

  @override
  String get navProfile => 'Профил';

  @override
  String get navDashboard => 'Табла';

  @override
  String get navManage => 'Управување';

  @override
  String get locationFallback =>
      'Локацијата не е достапна. Се прикажуваат резултати околу центарот на Скопје.';

  @override
  String get locationEnable => 'Овозможи';

  @override
  String get useMyLocation => 'Користи ја мојата локација';

  @override
  String get locating => 'Ја бараме вашата локација…';

  @override
  String get parkingTitle => 'AI Паркинг';

  @override
  String get parkingSubtitle => 'Рангирано за вас во моментов';

  @override
  String get rankingPreference => 'Приоритет на рангирање';

  @override
  String get presetBalanced => 'Избалансирано';

  @override
  String get presetClosest => 'Најблиско';

  @override
  String get presetCheapest => 'Најевтино';

  @override
  String get presetAvailable => 'Најмногу места';

  @override
  String get listView => 'Листа';

  @override
  String get mapView => 'Мапа';

  @override
  String spotsFree(int available, int capacity) {
    return '$available/$capacity слободни';
  }

  @override
  String get spotFull => 'Полно';

  @override
  String get priceFree => 'Бесплатно';

  @override
  String pricePerHour(String price) {
    return '$price/ч';
  }

  @override
  String scoreValue(int value) {
    return 'Оценка $value';
  }

  @override
  String get topPick => 'Најдобар избор';

  @override
  String get whyThisSpot => 'Зошто ова место?';

  @override
  String get factorDistance => 'Оддалеченост';

  @override
  String get factorAvailability => 'Достапност';

  @override
  String get factorPrice => 'Цена';

  @override
  String get factorDemand => 'Побарувачка во овој час';

  @override
  String get scoreExplanation =>
      'Оценката ги комбинира оддалеченоста од вас, слободните места, цената и очекуваната побарувачка за ова време од денот.';

  @override
  String get parkingTypeStreet => 'Улица';

  @override
  String get parkingTypeGarage => 'Гаража';

  @override
  String get parkingTypeLot => 'Отворен паркинг';

  @override
  String zoneLabel(String zone) {
    return 'Зона $zone';
  }

  @override
  String get payAndPark => 'Плати и паркирај';

  @override
  String get noSpotsTitle => 'Нема пронајден паркинг';

  @override
  String get noSpotsMessage => 'Во моментов нема паркинг места за прикажување.';

  @override
  String lastUpdated(String time) {
    return 'Ажурирано $time';
  }

  @override
  String get paymentTitle => 'Плати паркинг';

  @override
  String get selectDuration => 'Времетраење';

  @override
  String get plateLabel => 'Регистарска табличка';

  @override
  String get plateHint => 'SK 1234 AB';

  @override
  String get plateRequired => 'Внесете ја регистарската табличка';

  @override
  String get plateInvalid => 'Користете 4–10 букви и бројки';

  @override
  String get paymentMethod => 'Начин на плаќање';

  @override
  String get paymentCard => 'Картичка •••• 4242';

  @override
  String get paymentWallet => 'Мобилен паричник';

  @override
  String get paymentSms => 'СМС паркинг';

  @override
  String get totalLabel => 'Вкупно';

  @override
  String payAmount(String amount) {
    return 'Плати $amount';
  }

  @override
  String get startFreeSession => 'Започни сесија';

  @override
  String get mockPaymentNotice => 'Демо режим: не се врши вистинско плаќање.';

  @override
  String get paymentSuccess => 'Плаќањето е успешно. Вашата сесија започна.';

  @override
  String get spotFullError => 'Овој паркинг е полн. Изберете друг.';

  @override
  String get replaceSessionWarning =>
      'Започнувањето нова сесија ќе ја заврши тековната.';

  @override
  String get activeSessionTitle => 'Сесија за паркирање';

  @override
  String get timeRemaining => 'Преостанато време';

  @override
  String endsAt(String time) {
    return 'Завршува во $time';
  }

  @override
  String get extend => 'Продолжи';

  @override
  String get endSession => 'Заврши сесија';

  @override
  String get endSessionConfirm =>
      'Да се заврши сесијата сега? Неискористеното време не се враќа.';

  @override
  String get extendTitle => 'Продолжи сесија';

  @override
  String extendOption(String duration, String amount) {
    return 'Додај $duration · $amount';
  }

  @override
  String get sessionExtended => 'Сесијата е продолжена';

  @override
  String get sessionEnded => 'Сесијата за паркирање заврши';

  @override
  String get sessionExpiredTitle => 'Паркингот истече';

  @override
  String sessionExpiredMessage(String spot) {
    return 'Вашата сесија на $spot истече. Преместете го возилото или започнете нова сесија за да избегнете казна.';
  }

  @override
  String get sessionWarningTitle => 'Уште 10 минути';

  @override
  String sessionWarningMessage(String spot) {
    return 'Вашиот паркинг на $spot истекува за помалку од 10 минути.';
  }

  @override
  String sessionBanner(String spot, String time) {
    return 'Паркинг на $spot · уште $time';
  }

  @override
  String get viewSession => 'Прикажи';

  @override
  String get noActiveSessionTitle => 'Нема активна сесија';

  @override
  String get noActiveSessionMessage =>
      'Изберете паркинг место за да започнете сесија.';

  @override
  String get amountPaid => 'Платено';

  @override
  String get startedAt => 'Започната';

  @override
  String get sessionExpiredBadge => 'Истечена';

  @override
  String get myReports => 'Мои пријави';

  @override
  String get newReport => 'Нова пријава';

  @override
  String get categoryLabel => 'Категорија';

  @override
  String get categoryPothole => 'Дупка на патот';

  @override
  String get categoryStreetlight => 'Расипано улично светло';

  @override
  String get categoryGraffiti => 'Графити';

  @override
  String get categoryTrash => 'Отпад';

  @override
  String get categoryDamagedSign => 'Оштетен знак';

  @override
  String get categoryOther => 'Друго';

  @override
  String get descriptionLabel => 'Опис';

  @override
  String get descriptionHint => 'Опишете го проблемот и каде точно се наоѓа';

  @override
  String get descriptionRequired => 'Опишете го проблемот';

  @override
  String get descriptionTooShort => 'Додадете најмалку 10 знаци';

  @override
  String get locationLabel => 'Локација';

  @override
  String get pickOnMap => 'Избери на мапа';

  @override
  String get locationNotSet => 'Не е избрана локација';

  @override
  String get locationRequired => 'Изберете локација';

  @override
  String get addPhoto => 'Додај фотографија';

  @override
  String get photoAttached => 'Фотографијата е прикачена';

  @override
  String get removePhoto => 'Отстрани фотографија';

  @override
  String get photoDemoNote =>
      'Прикачувањето фотографии е симулирано во демо режим.';

  @override
  String get submitReport => 'Испрати пријава';

  @override
  String get reportSubmitted => 'Пријавата е испратена. Ви благодариме!';

  @override
  String get noReportsTitle => 'Сè уште нема пријави';

  @override
  String get noReportsMessage =>
      'Забележавте проблем во вашето соседство? Допрете + за да го пријавите.';

  @override
  String get reportDetails => 'Детали за пријавата';

  @override
  String get statusLabel => 'Статус';

  @override
  String get statusSubmitted => 'Испратена';

  @override
  String get statusInReview => 'Во разгледување';

  @override
  String get statusInProgress => 'Во тек';

  @override
  String get statusResolved => 'Решена';

  @override
  String get priorityLabel => 'Приоритет';

  @override
  String get priorityLow => 'Низок';

  @override
  String get priorityMedium => 'Среден';

  @override
  String get priorityHigh => 'Висок';

  @override
  String get priorityCritical => 'Критичен';

  @override
  String reportedOn(String date) {
    return 'Пријавено $date';
  }

  @override
  String get neighborhoodLabel => 'Населба';

  @override
  String get progressLabel => 'Напредок';

  @override
  String get municipalityNotes => 'Ажурирања од општината';

  @override
  String get noNotes => 'Сè уште нема ажурирања';

  @override
  String get pickLocationTitle => 'Изберете локација';

  @override
  String get tapToPlace => 'Допрете ја мапата за да ја поставите иглата';

  @override
  String get confirmLocation => 'Потврди локација';

  @override
  String get photoLabel => 'Фотографија';

  @override
  String get manageReports => 'Управување со пријави';

  @override
  String get filterStatus => 'Статус';

  @override
  String get filterCategory => 'Категорија';

  @override
  String get filterPriority => 'Приоритет';

  @override
  String get filterNeighborhood => 'Населба';

  @override
  String get sortNewest => 'Најнови прво';

  @override
  String get sortPriority => 'Највисок приоритет';

  @override
  String get assignTo => 'Додели на';

  @override
  String get assigneeLabel => 'Задолжен';

  @override
  String get unassigned => 'Недоделена';

  @override
  String assignedTo(String name) {
    return 'Доделена на $name';
  }

  @override
  String get changeStatus => 'Промени статус';

  @override
  String get noStatusChanges => 'Нема други достапни промени на статусот';

  @override
  String get notesLabel => 'Белешки';

  @override
  String get addNote => 'Додај белешка';

  @override
  String get noteHint => 'Напишете белешка за тимот и граѓанинот…';

  @override
  String get noteAdded => 'Белешката е додадена';

  @override
  String get reportUpdated => 'Пријавата е ажурирана';

  @override
  String get invalidTransition => 'Оваа промена на статусот не е дозволена';

  @override
  String get noMatchingTitle => 'Нема соодветни пријави';

  @override
  String get noMatchingMessage =>
      'Обидете се да ги промените или исчистите филтрите.';

  @override
  String reportsCount(int count) {
    return '$count пријави';
  }

  @override
  String get createdLabel => 'Креирана';

  @override
  String get departmentRoads => 'Патишта';

  @override
  String get departmentLighting => 'Осветлување';

  @override
  String get departmentSanitation => 'Хигиена';

  @override
  String get departmentPublicSpaces => 'Јавни површини';

  @override
  String get cityMapTitle => 'Мапа на градот';

  @override
  String get layersLabel => 'Слоеви';

  @override
  String get layerParking => 'Паркинг';

  @override
  String get layerReports => 'Пријави';

  @override
  String get availabilityHigh => 'Многу места';

  @override
  String get availabilityMedium => 'Ограничено';

  @override
  String get availabilityLow => 'Речиси полно';

  @override
  String get availabilityNone => 'Полно';

  @override
  String get mapAttribution => 'Соработници на OpenStreetMap';

  @override
  String clusterZoomHint(int count) {
    return '$count ставки овде. Зумирајте за да ги видите.';
  }

  @override
  String get dashboardTitle => 'Градска табла';

  @override
  String greeting(String name) {
    return 'Здраво, $name';
  }

  @override
  String get kpiOpenReports => 'Отворени пријави';

  @override
  String get kpiAvgResolution => 'Просечно решавање';

  @override
  String get kpiOccupancy => 'Пополнетост на паркинзи';

  @override
  String get kpiRevenue => 'Приход денес';

  @override
  String valueHours(String value) {
    return '$value ч';
  }

  @override
  String valueDays(String value) {
    return '$value дена';
  }

  @override
  String get notAvailable => 'н/д';

  @override
  String get chartByCategory => 'Пријави по категорија';

  @override
  String get chartOverTime => 'Пријави во последните 14 дена';

  @override
  String get chartOccupancyByHour => 'Пополнетост на паркинзи по час (%)';

  @override
  String get aiInsights => 'AI увиди';

  @override
  String get noInsights => 'Во моментов нема значајни трендови.';

  @override
  String get reportManagement => 'Управување со пријави';

  @override
  String get viewAll => 'Прикажи сè';

  @override
  String insightSpike(String category, String neighborhood, int percent) {
    return '$category во $neighborhood пораснаа $percent% оваа недела';
  }

  @override
  String insightDrop(String category, int percent) {
    return 'Пријавите за $category се намалија $percent% во целиот град оваа недела';
  }

  @override
  String insightHotspot(String neighborhood, int count) {
    return '$neighborhood има најмногу отворени пријави ($count)';
  }

  @override
  String insightUnassigned(int count) {
    return '$count пријави со висок приоритет сè уште не се доделени';
  }

  @override
  String insightSlowResolution(String category, String days) {
    return '$category: во просек $days дена до решавање';
  }

  @override
  String insightPeakOccupancy(String hour, int percent) {
    return 'Побарувачката за паркинг е највисока околу $hour со $percent%';
  }

  @override
  String insightFullParking(int count) {
    return '$count паркинзи се пополнети над 90%';
  }

  @override
  String get assistantTitle => 'Градски асистент';

  @override
  String get assistantSubtitle => 'Паркинг, сообраќај и градски услуги';

  @override
  String get assistantWelcome =>
      'Здраво! Јас сум вашиот UrbanFlow асистент. Прашајте ме за паркинг, сообраќај или градски услуги.';

  @override
  String get messageHint => 'Прашајте ме што било за градот…';

  @override
  String get assistantTyping => 'Асистентот пишува…';

  @override
  String get clearChat => 'Исчисти разговор';

  @override
  String get qrFindParking => 'Најди паркинг близу мене';

  @override
  String get qrParkingPrice => 'Цени на паркинг';

  @override
  String get qrTraffic => 'Сообраќај во моментов';

  @override
  String get qrReportIssue => 'Како да пријавам проблем?';

  @override
  String get qrMyReports => 'Статус на моите пријави';

  @override
  String get qrCityHours => 'Работно време на Градот';

  @override
  String get qrEmergency => 'Итни броеви';

  @override
  String get aiGreeting => 'Здраво! Како можам да ви помогнам денес?';

  @override
  String get aiThanks => 'Нема зошто! Можам ли да помогнам со нешто друго?';

  @override
  String get aiFallback =>
      'Не сум сигурен дека разбрав. Можам да помогнам со паркинг, сообраќај, пријави и градски услуги.';

  @override
  String aiParkingBest(String name, String distance, int free, String price) {
    return 'Најдобра опција близу вас во моментов: $name, оддалеченост $distance, $free слободни места, $price.';
  }

  @override
  String get aiParkingNone =>
      'Во моментов не најдов слободен паркинг во близина. Обидете се повторно за неколку минути.';

  @override
  String aiParkingPrices(String zoneA, String zoneB, String zoneC) {
    return 'Јавниот паркинг во Скопје се наплаќа по зони: Зона А $zoneA, Зона Б $zoneB, Зона В $zoneC на час. Многу гаражи во трговски центри се бесплатни.';
  }

  @override
  String aiSessionActive(String name, String time) {
    return 'На вашата сесија на $name ѝ преостануваат $time.';
  }

  @override
  String get aiSessionNone => 'Немате активна сесија за паркирање.';

  @override
  String aiTrafficHeavy(String streets) {
    return 'Сообраќајот е густ во моментов, особено на $streets. Предвидете дополнително време.';
  }

  @override
  String aiTrafficModerate(String streets) {
    return 'Сообраќајот е умерен. Очекувајте доцнења на $streets.';
  }

  @override
  String get aiTrafficLight =>
      'Сообраќајот е слаб низ целиот град во моментов.';

  @override
  String get aiReportHowTo =>
      'Отворете Пријави, допрете +, изберете категорија, опишете го проблемот и означете ја локацијата на мапата. Статусот можете да го следите во Мои пријави.';

  @override
  String aiReportStatus(int total, int open, int resolved) {
    return 'Имате $total пријави: $open отворени и $resolved решени.';
  }

  @override
  String get aiReportStatusNone => 'Сè уште немате испратено пријави.';

  @override
  String get aiCityHours =>
      'Канцелариите на Град Скопје работат од понеделник до петок, од 08:00 до 16:00. Многу услуги се достапни и онлајн.';

  @override
  String get aiEmergency =>
      'Итни броеви во Северна Македонија: 112 општ број за итни случаи, 192 полиција, 193 противпожарна, 194 брза помош.';

  @override
  String get aiTransport =>
      'Градските автобуси сообраќаат од околу 05:00 до 23:00. Главни точки се Транспортниот центар и постојките во центарот.';

  @override
  String get aiWaste =>
      'Отпадот се собира секој ден во централните делови и два до три пати неделно во другите. Пријавете преполни контејнери во Пријави.';

  @override
  String get settingsTitle => 'Профил и поставки';

  @override
  String get signedInAs => 'Најавени како';

  @override
  String get appearance => 'Изглед';

  @override
  String get themeSystem => 'Системски';

  @override
  String get themeLight => 'Светол';

  @override
  String get themeDark => 'Темен';

  @override
  String get languageLabel => 'Јазик';

  @override
  String get aboutLabel => 'За апликацијата';

  @override
  String get aboutText =>
      'UrbanFlow AI им помага на граѓаните и на Град Скопје градот да се движи.';

  @override
  String versionLabel(String version) {
    return 'Верзија $version';
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
  String get scoreLabel => 'Оценка';
}
