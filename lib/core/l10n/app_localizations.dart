import 'package:flutter/material.dart';

class AppLocalizations {
  final Locale locale;

  AppLocalizations(this.locale);

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const delegate = _AppLocalizationsDelegate();

  static const supportedLocales = [
    Locale('en'),
    Locale('sq'), // Albanian
    Locale('mk'), // Macedonian
    Locale('tr'), // Turkish
  ];

  static const Map<String, Map<String, String>> _translations = {
    'en': {
      'app_name': 'UrbanFlow AI',
      'tagline': 'Smart city management at your fingertips',
      'login': 'Log In',
      'register': 'Create Account',
      'email': 'Email',
      'password': 'Password',
      'name': 'Full Name',
      'phone': 'Phone Number',
      'forgot_password': 'Forgot password?',
      'no_account': "Don't have an account?",
      'have_account': 'Already have an account?',
      'logout': 'Log out',
      'home': 'Home',
      'parking': 'Parking',
      'reports': 'Reports',
      'map': 'City Map',
      'profile': 'Profile',
      'dashboard': 'Dashboard',
      'notifications': 'Notifications',
      'settings': 'Settings',
      'welcome_back': 'Welcome back',
      'good_morning': 'Good morning',
      'good_afternoon': 'Good afternoon',
      'good_evening': 'Good evening',
      'quick_actions': 'Quick Actions',
      'find_parking': 'Find Parking',
      'report_issue': 'Report Issue',
      'live_map': 'Live Map',
      'municipality': 'Municipality',
      'active_parking': 'Active Parking',
      'no_active_parking': 'No active parking session',
      'start_parking': 'Start Parking',
      'extend_time': 'Extend Time',
      'end_session': 'End Session',
      'time_remaining': 'Time Remaining',
      'pay_now': 'Pay Now',
      'payment_history': 'Payment History',
      'price_per_hour': 'Price / Hour',
      'total_amount': 'Total Amount',
      'duration': 'Duration',
      'license_plate': 'License Plate',
      'payment_method': 'Payment Method',
      'confirm_payment': 'Confirm Payment',
      'payment_success': 'Payment Successful',
      'available': 'Available',
      'limited': 'Limited',
      'full': 'Full',
      'closed': 'Closed',
      'spots_available': 'spots available',
      'ai_recommendation': 'AI Recommendation',
      'best_option': 'Best Option',
      'walking_distance': 'walking',
      'nearby_parking': 'Nearby Parking',
      'create_report': 'Create Report',
      'my_reports': 'My Reports',
      'all_reports': 'All Reports',
      'report_title': 'Report Title',
      'description': 'Description',
      'category': 'Category',
      'location': 'Location',
      'add_photo': 'Add Photo',
      'submit_report': 'Submit Report',
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'resolved': 'Resolved',
      'rejected': 'Rejected',
      'upvote': 'Upvote',
      'comments': 'Comments',
      'add_comment': 'Add a comment',
      'no_reports': 'No reports yet',
      'no_reports_subtitle': 'Be the first to report an issue in your area',
      'traffic': 'Traffic',
      'pothole': 'Pothole',
      'street_light': 'Street Light',
      'accident': 'Accident',
      'waste': 'Waste',
      'illegal_dumping': 'Illegal Dumping',
      'flooding': 'Flooding',
      'noise_pollution': 'Noise',
      'vandalism': 'Vandalism',
      'other': 'Other',
      'city_map': 'City Map',
      'parking_layer': 'Parking',
      'reports_layer': 'Reports',
      'traffic_layer': 'Traffic',
      'analytics': 'Analytics',
      'total_reports': 'Total Reports',
      'response_time': 'Avg. Response Time',
      'resolved_rate': 'Resolution Rate',
      'priority_issues': 'Priority Issues',
      'assign_to': 'Assign To',
      'update_status': 'Update Status',
      'municipality_note': 'Official Note',
      'language': 'Language',
      'english': 'English',
      'albanian': 'Albanian',
      'macedonian': 'Macedonian',
      'turkish': 'Turkish',
      'premium': 'Premium',
      'upgrade_premium': 'Upgrade to Premium',
      'premium_features': 'Premium Features',
      'cancel': 'Cancel',
      'save': 'Save',
      'edit': 'Edit',
      'delete': 'Delete',
      'confirm': 'Confirm',
      'back': 'Back',
      'search': 'Search',
      'filter': 'Filter',
      'sort_by': 'Sort by',
      'loading': 'Loading...',
      'error': 'Something went wrong',
      'retry': 'Retry',
      'no_internet': 'No internet connection',
      'offline_mode': 'Offline Mode',
      'version': 'Version',
      'privacy_policy': 'Privacy Policy',
      'terms': 'Terms of Service',
      'help': 'Help & Support',
      'about': 'About',
      'mark_all_read': 'Mark all as read',
      'no_notifications': 'No notifications',
    },
    'sq': {
      'app_name': 'UrbanFlow AI',
      'tagline': 'Menaxhimi i qytetit inteligjent në majë të gishtave',
      'login': 'Hyr',
      'register': 'Krijo Llogari',
      'email': 'Email',
      'password': 'Fjalëkalim',
      'name': 'Emri i Plotë',
      'phone': 'Numri i Telefonit',
      'forgot_password': 'Keni harruar fjalëkalimin?',
      'no_account': "Nuk keni llogari?",
      'have_account': 'Keni tashmë llogari?',
      'logout': 'Dil',
      'home': 'Kryefaqe',
      'parking': 'Parkim',
      'reports': 'Raporte',
      'map': 'Harta',
      'profile': 'Profili',
      'dashboard': 'Paneli',
      'notifications': 'Njoftimet',
      'settings': 'Cilësimet',
      'welcome_back': 'Mirë se u kthyet',
      'good_morning': 'Mirëmëngjes',
      'good_afternoon': 'Mirëdita',
      'good_evening': 'Mirëmbrëma',
      'quick_actions': 'Veprime të Shpejta',
      'find_parking': 'Gjej Parkim',
      'report_issue': 'Raporto Problem',
      'live_map': 'Harta Live',
      'municipality': 'Komuna',
      'active_parking': 'Parkim Aktiv',
      'no_active_parking': 'Nuk ka seancë aktive parkimi',
      'start_parking': 'Fillo Parkimin',
      'extend_time': 'Zgjat Kohën',
      'end_session': 'Përfundo Seancën',
      'time_remaining': 'Koha e Mbetur',
      'pay_now': 'Paguaj Tani',
      'payment_history': 'Historia e Pagesave',
      'price_per_hour': 'Çmimi / Orë',
      'total_amount': 'Shuma Totale',
      'duration': 'Kohëzgjatja',
      'license_plate': 'Targa',
      'payment_method': 'Metoda e Pagesës',
      'confirm_payment': 'Konfirmo Pagesën',
      'payment_success': 'Pagesa u Krye',
      'available': 'Disponueshëm',
      'limited': 'I Kufizuar',
      'full': 'I Plotë',
      'closed': 'Mbyllur',
      'spots_available': 'vende disponueshme',
      'ai_recommendation': 'Rekomandim AI',
      'best_option': 'Opsioni Më i Mirë',
      'walking_distance': 'në këmbë',
      'nearby_parking': 'Parkim Afër',
      'create_report': 'Krijo Raport',
      'my_reports': 'Raportet e Mia',
      'all_reports': 'Të Gjitha Raportet',
      'report_title': 'Titulli i Raportit',
      'description': 'Përshkrimi',
      'category': 'Kategoria',
      'location': 'Vendndodhja',
      'add_photo': 'Shto Foto',
      'submit_report': 'Dërgo Raportin',
      'pending': 'Në Pritje',
      'in_progress': 'Në Progres',
      'resolved': 'Zgjidhur',
      'rejected': 'Refuzuar',
      'upvote': 'Mbështes',
      'comments': 'Komentet',
      'add_comment': 'Shto koment',
      'no_reports': 'Ende nuk ka raporte',
      'no_reports_subtitle': 'Bëhuni i pari që raporton problem në zonën tuaj',
      'traffic': 'Trafik',
      'pothole': 'Gropë',
      'street_light': 'Ndriçim Rrugor',
      'accident': 'Aksident',
      'waste': 'Mbeturina',
      'illegal_dumping': 'Hedhje Ilegale',
      'flooding': 'Përmbytje',
      'noise_pollution': 'Zhurma',
      'vandalism': 'Vandalizëm',
      'other': 'Tjetër',
      'city_map': 'Harta e Qytetit',
      'parking_layer': 'Parkim',
      'reports_layer': 'Raporte',
      'traffic_layer': 'Trafik',
      'analytics': 'Analitika',
      'total_reports': 'Gjithsej Raporte',
      'response_time': 'Koha Mesatare e Përgjigjes',
      'resolved_rate': 'Shkalla e Zgjidhjes',
      'priority_issues': 'Çështje Prioritare',
      'assign_to': 'Cakto Tek',
      'update_status': 'Përditëso Statusin',
      'municipality_note': 'Shënim Zyrtar',
      'language': 'Gjuha',
      'english': 'Anglisht',
      'albanian': 'Shqip',
      'macedonian': 'Maqedonisht',
      'turkish': 'Turqisht',
      'premium': 'Premium',
      'upgrade_premium': 'Kaloni në Premium',
      'premium_features': 'Veçori Premium',
      'cancel': 'Anulo',
      'save': 'Ruaj',
      'edit': 'Ndrysho',
      'delete': 'Fshi',
      'confirm': 'Konfirmo',
      'back': 'Kthehu',
      'search': 'Kërko',
      'filter': 'Filtro',
      'sort_by': 'Rendit sipas',
      'loading': 'Duke ngarkuar...',
      'error': 'Diçka shkoi gabim',
      'retry': 'Provo Përsëri',
      'no_internet': 'Nuk ka lidhje interneti',
      'offline_mode': 'Mënyra Offline',
      'version': 'Versioni',
      'privacy_policy': 'Politika e Privatësisë',
      'terms': 'Kushtet e Shërbimit',
      'help': 'Ndihmë & Mbështetje',
      'about': 'Rreth',
      'mark_all_read': 'Shëno të gjitha si lexuar',
      'no_notifications': 'Nuk ka njoftime',
    },
    'mk': {
      'app_name': 'UrbanFlow AI',
      'tagline': 'Паметно управување со градот на врвот на прстите',
      'login': 'Влез',
      'register': 'Создај Сметка',
      'email': 'Е-пошта',
      'password': 'Лозинка',
      'name': 'Целосно Име',
      'phone': 'Телефонски Број',
      'forgot_password': 'Ја заборавивте лозинката?',
      'no_account': "Немате сметка?",
      'have_account': 'Веќе имате сметка?',
      'logout': 'Одјава',
      'home': 'Дома',
      'parking': 'Паркинг',
      'reports': 'Пријави',
      'map': 'Карта',
      'profile': 'Профил',
      'dashboard': 'Контролна Табла',
      'notifications': 'Известувања',
      'settings': 'Поставки',
      'welcome_back': 'Добредојдовте назад',
      'good_morning': 'Добро утро',
      'good_afternoon': 'Добар ден',
      'good_evening': 'Добра вечер',
      'quick_actions': 'Брзи Акции',
      'find_parking': 'Најди Паркинг',
      'report_issue': 'Пријави Проблем',
      'live_map': 'Карта во живо',
      'municipality': 'Општина',
      'active_parking': 'Активен Паркинг',
      'no_active_parking': 'Нема активна паркинг сесија',
      'start_parking': 'Започни Паркирање',
      'extend_time': 'Продолжи Времето',
      'end_session': 'Заврши Сесија',
      'time_remaining': 'Преостанато Времетраење',
      'pay_now': 'Плати Сега',
      'payment_history': 'Историја на Плаќања',
      'price_per_hour': 'Цена / Час',
      'total_amount': 'Вкупен Износ',
      'duration': 'Времетраење',
      'license_plate': 'Таблица',
      'payment_method': 'Начин на Плаќање',
      'confirm_payment': 'Потврди Плаќање',
      'payment_success': 'Плаќањето е Успешно',
      'available': 'Достапно',
      'limited': 'Ограничено',
      'full': 'Полно',
      'closed': 'Затворено',
      'spots_available': 'достапни места',
      'ai_recommendation': 'AI Препорака',
      'best_option': 'Најдобра Опција',
      'walking_distance': 'пешачење',
      'nearby_parking': 'Паркинг во Близина',
      'create_report': 'Создај Пријава',
      'my_reports': 'Моите Пријави',
      'all_reports': 'Сите Пријави',
      'report_title': 'Наслов на Пријавата',
      'description': 'Опис',
      'category': 'Категорија',
      'location': 'Локација',
      'add_photo': 'Додај Фото',
      'submit_report': 'Испрати Пријава',
      'pending': 'На Чекање',
      'in_progress': 'Во Тек',
      'resolved': 'Решено',
      'rejected': 'Одбиено',
      'upvote': 'Поддржи',
      'comments': 'Коментари',
      'add_comment': 'Додај коментар',
      'no_reports': 'Сè уште нема пријави',
      'no_reports_subtitle': 'Бидете први да пријавите проблем во вашата област',
      'traffic': 'Сообраќај',
      'pothole': 'Дупка',
      'street_light': 'Улично Осветлување',
      'accident': 'Несреќа',
      'waste': 'Отпад',
      'illegal_dumping': 'Нелегално Фрлање',
      'flooding': 'Поплава',
      'noise_pollution': 'Бучава',
      'vandalism': 'Вандализам',
      'other': 'Друго',
      'city_map': 'Градска Карта',
      'parking_layer': 'Паркинг',
      'reports_layer': 'Пријави',
      'traffic_layer': 'Сообраќај',
      'analytics': 'Аналитика',
      'total_reports': 'Вкупно Пријави',
      'response_time': 'Просечно Време на Одговор',
      'resolved_rate': 'Стапка на Решавање',
      'priority_issues': 'Приоритетни Прашања',
      'assign_to': 'Додели На',
      'update_status': 'Ажурирај Статус',
      'municipality_note': 'Службена Забелешка',
      'language': 'Јазик',
      'english': 'Англиски',
      'albanian': 'Албански',
      'macedonian': 'Македонски',
      'turkish': 'Турски',
      'premium': 'Премиум',
      'upgrade_premium': 'Надгради на Премиум',
      'premium_features': 'Премиум Функции',
      'cancel': 'Откажи',
      'save': 'Зачувај',
      'edit': 'Уреди',
      'delete': 'Избриши',
      'confirm': 'Потврди',
      'back': 'Назад',
      'search': 'Пребарај',
      'filter': 'Филтрирај',
      'sort_by': 'Сортирај по',
      'loading': 'Вчитување...',
      'error': 'Нешто тргна наопаку',
      'retry': 'Обиди Повторно',
      'no_internet': 'Нема интернет врска',
      'offline_mode': 'Офлајн Режим',
      'version': 'Верзија',
      'privacy_policy': 'Политика на Приватност',
      'terms': 'Услови на Употреба',
      'help': 'Помош и Поддршка',
      'about': 'За апликацијата',
      'mark_all_read': 'Означи сите како прочитани',
      'no_notifications': 'Нема известувања',
    },
    'tr': {
      'app_name': 'UrbanFlow AI',
      'tagline': 'Akıllı şehir yönetimi parmaklarınızın ucunda',
      'login': 'Giriş Yap',
      'register': 'Hesap Oluştur',
      'email': 'E-posta',
      'password': 'Şifre',
      'name': 'Tam Ad',
      'phone': 'Telefon Numarası',
      'forgot_password': 'Şifrenizi mi unuttunuz?',
      'no_account': "Hesabınız yok mu?",
      'have_account': 'Zaten hesabınız var mı?',
      'logout': 'Çıkış',
      'home': 'Ana Sayfa',
      'parking': 'Park',
      'reports': 'Raporlar',
      'map': 'Harita',
      'profile': 'Profil',
      'dashboard': 'Panel',
      'notifications': 'Bildirimler',
      'settings': 'Ayarlar',
      'welcome_back': 'Tekrar hoş geldiniz',
      'good_morning': 'Günaydın',
      'good_afternoon': 'İyi günler',
      'good_evening': 'İyi akşamlar',
      'quick_actions': 'Hızlı İşlemler',
      'find_parking': 'Park Yeri Bul',
      'report_issue': 'Sorun Bildir',
      'live_map': 'Canlı Harita',
      'municipality': 'Belediye',
      'active_parking': 'Aktif Park',
      'no_active_parking': 'Aktif park oturumu yok',
      'start_parking': 'Parklamaya Başla',
      'extend_time': 'Süreyi Uzat',
      'end_session': 'Oturumu Bitir',
      'time_remaining': 'Kalan Süre',
      'pay_now': 'Şimdi Öde',
      'payment_history': 'Ödeme Geçmişi',
      'price_per_hour': 'Saat Ücreti',
      'total_amount': 'Toplam Tutar',
      'duration': 'Süre',
      'license_plate': 'Plaka',
      'payment_method': 'Ödeme Yöntemi',
      'confirm_payment': 'Ödemeyi Onayla',
      'payment_success': 'Ödeme Başarılı',
      'available': 'Müsait',
      'limited': 'Sınırlı',
      'full': 'Dolu',
      'closed': 'Kapalı',
      'spots_available': 'boş yer',
      'ai_recommendation': 'AI Önerisi',
      'best_option': 'En İyi Seçenek',
      'walking_distance': 'yürüme',
      'nearby_parking': 'Yakın Park Yerleri',
      'create_report': 'Rapor Oluştur',
      'my_reports': 'Raporlarım',
      'all_reports': 'Tüm Raporlar',
      'report_title': 'Rapor Başlığı',
      'description': 'Açıklama',
      'category': 'Kategori',
      'location': 'Konum',
      'add_photo': 'Fotoğraf Ekle',
      'submit_report': 'Raporu Gönder',
      'pending': 'Beklemede',
      'in_progress': 'Devam Ediyor',
      'resolved': 'Çözüldü',
      'rejected': 'Reddedildi',
      'upvote': 'Destekle',
      'comments': 'Yorumlar',
      'add_comment': 'Yorum ekle',
      'no_reports': 'Henüz rapor yok',
      'no_reports_subtitle': 'Bölgenizdeki bir sorunu ilk bildiren siz olun',
      'traffic': 'Trafik',
      'pothole': 'Çukur',
      'street_light': 'Sokak Lambası',
      'accident': 'Kaza',
      'waste': 'Çöp',
      'illegal_dumping': 'Yasadışı Döküm',
      'flooding': 'Su Baskını',
      'noise_pollution': 'Gürültü',
      'vandalism': 'Vandalizm',
      'other': 'Diğer',
      'city_map': 'Şehir Haritası',
      'parking_layer': 'Park',
      'reports_layer': 'Raporlar',
      'traffic_layer': 'Trafik',
      'analytics': 'Analitik',
      'total_reports': 'Toplam Raporlar',
      'response_time': 'Ort. Yanıt Süresi',
      'resolved_rate': 'Çözüm Oranı',
      'priority_issues': 'Öncelikli Sorunlar',
      'assign_to': 'Atama Yap',
      'update_status': 'Durumu Güncelle',
      'municipality_note': 'Resmi Not',
      'language': 'Dil',
      'english': 'İngilizce',
      'albanian': 'Arnavutça',
      'macedonian': 'Makedonca',
      'turkish': 'Türkçe',
      'premium': 'Premium',
      'upgrade_premium': 'Premium\'a Geç',
      'premium_features': 'Premium Özellikler',
      'cancel': 'İptal',
      'save': 'Kaydet',
      'edit': 'Düzenle',
      'delete': 'Sil',
      'confirm': 'Onayla',
      'back': 'Geri',
      'search': 'Ara',
      'filter': 'Filtrele',
      'sort_by': 'Sırala',
      'loading': 'Yükleniyor...',
      'error': 'Bir şeyler yanlış gitti',
      'retry': 'Tekrar Dene',
      'no_internet': 'İnternet bağlantısı yok',
      'offline_mode': 'Çevrimdışı Mod',
      'version': 'Sürüm',
      'privacy_policy': 'Gizlilik Politikası',
      'terms': 'Hizmet Şartları',
      'help': 'Yardım & Destek',
      'about': 'Hakkında',
      'mark_all_read': 'Tümünü okundu işaretle',
      'no_notifications': 'Bildirim yok',
    },
  };

  String translate(String key) {
    final langCode = locale.languageCode;
    return _translations[langCode]?[key] ??
        _translations['en']?[key] ??
        key;
  }

  String get appName => translate('app_name');
  String get tagline => translate('tagline');
  String get login => translate('login');
  String get register => translate('register');
  String get email => translate('email');
  String get password => translate('password');
  String get name => translate('name');
  String get phone => translate('phone');
  String get forgotPassword => translate('forgot_password');
  String get noAccount => translate('no_account');
  String get haveAccount => translate('have_account');
  String get logout => translate('logout');
  String get home => translate('home');
  String get parking => translate('parking');
  String get reports => translate('reports');
  String get map => translate('map');
  String get profile => translate('profile');
  String get dashboard => translate('dashboard');
  String get notifications => translate('notifications');
  String get settings => translate('settings');
  String get welcomeBack => translate('welcome_back');
  String get goodMorning => translate('good_morning');
  String get goodAfternoon => translate('good_afternoon');
  String get goodEvening => translate('good_evening');
  String get quickActions => translate('quick_actions');
  String get findParking => translate('find_parking');
  String get reportIssue => translate('report_issue');
  String get liveMap => translate('live_map');
  String get municipality => translate('municipality');
  String get activeParking => translate('active_parking');
  String get noActiveParking => translate('no_active_parking');
  String get startParking => translate('start_parking');
  String get extendTime => translate('extend_time');
  String get endSession => translate('end_session');
  String get timeRemaining => translate('time_remaining');
  String get payNow => translate('pay_now');
  String get paymentHistory => translate('payment_history');
  String get pricePerHour => translate('price_per_hour');
  String get totalAmount => translate('total_amount');
  String get duration => translate('duration');
  String get licensePlate => translate('license_plate');
  String get paymentMethod => translate('payment_method');
  String get confirmPayment => translate('confirm_payment');
  String get paymentSuccess => translate('payment_success');
  String get available => translate('available');
  String get limited => translate('limited');
  String get full => translate('full');
  String get closed => translate('closed');
  String get spotsAvailable => translate('spots_available');
  String get aiRecommendation => translate('ai_recommendation');
  String get bestOption => translate('best_option');
  String get walkingDistance => translate('walking_distance');
  String get nearbyParking => translate('nearby_parking');
  String get createReport => translate('create_report');
  String get myReports => translate('my_reports');
  String get allReports => translate('all_reports');
  String get reportTitle => translate('report_title');
  String get description => translate('description');
  String get category => translate('category');
  String get location => translate('location');
  String get addPhoto => translate('add_photo');
  String get submitReport => translate('submit_report');
  String get pending => translate('pending');
  String get inProgress => translate('in_progress');
  String get resolved => translate('resolved');
  String get rejected => translate('rejected');
  String get upvote => translate('upvote');
  String get comments => translate('comments');
  String get addComment => translate('add_comment');
  String get noReports => translate('no_reports');
  String get noReportsSubtitle => translate('no_reports_subtitle');
  String get traffic => translate('traffic');
  String get pothole => translate('pothole');
  String get streetLight => translate('street_light');
  String get accident => translate('accident');
  String get waste => translate('waste');
  String get illegalDumping => translate('illegal_dumping');
  String get flooding => translate('flooding');
  String get noisePollution => translate('noise_pollution');
  String get vandalism => translate('vandalism');
  String get other => translate('other');
  String get cityMap => translate('city_map');
  String get parkingLayer => translate('parking_layer');
  String get reportsLayer => translate('reports_layer');
  String get trafficLayer => translate('traffic_layer');
  String get analytics => translate('analytics');
  String get totalReports => translate('total_reports');
  String get responseTime => translate('response_time');
  String get resolvedRate => translate('resolved_rate');
  String get priorityIssues => translate('priority_issues');
  String get assignTo => translate('assign_to');
  String get updateStatus => translate('update_status');
  String get municipalityNote => translate('municipality_note');
  String get language => translate('language');
  String get english => translate('english');
  String get albanian => translate('albanian');
  String get macedonian => translate('macedonian');
  String get turkish => translate('turkish');
  String get premium => translate('premium');
  String get upgradePremium => translate('upgrade_premium');
  String get premiumFeatures => translate('premium_features');
  String get cancel => translate('cancel');
  String get save => translate('save');
  String get edit => translate('edit');
  String get delete => translate('delete');
  String get confirm => translate('confirm');
  String get back => translate('back');
  String get search => translate('search');
  String get filter => translate('filter');
  String get sortBy => translate('sort_by');
  String get loading => translate('loading');
  String get error => translate('error');
  String get retry => translate('retry');
  String get noInternet => translate('no_internet');
  String get offlineMode => translate('offline_mode');
  String get version => translate('version');
  String get privacyPolicy => translate('privacy_policy');
  String get terms => translate('terms');
  String get help => translate('help');
  String get about => translate('about');
  String get markAllRead => translate('mark_all_read');
  String get noNotifications => translate('no_notifications');

  String greeting(String name) {
    final hour = DateTime.now().hour;
    String timeGreeting;
    if (hour < 12) {
      timeGreeting = goodMorning;
    } else if (hour < 17) {
      timeGreeting = goodAfternoon;
    } else {
      timeGreeting = goodEvening;
    }
    return '$timeGreeting, $name';
  }
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) =>
      AppLocalizations.supportedLocales
          .any((l) => l.languageCode == locale.languageCode);

  @override
  Future<AppLocalizations> load(Locale locale) async =>
      AppLocalizations(locale);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}
