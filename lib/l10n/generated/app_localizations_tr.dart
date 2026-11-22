// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Turkish (`tr`).
class AppLocalizationsTr extends AppLocalizations {
  AppLocalizationsTr([String locale = 'tr']) : super(locale);

  @override
  String get appName => 'UrbanFlow AI';

  @override
  String get appTagline => 'Üsküp için akıllı şehir hizmetleri';

  @override
  String get retry => 'Tekrar dene';

  @override
  String get cancel => 'İptal';

  @override
  String get confirm => 'Onayla';

  @override
  String get save => 'Kaydet';

  @override
  String get close => 'Kapat';

  @override
  String get ok => 'Tamam';

  @override
  String get send => 'Gönder';

  @override
  String get all => 'Tümü';

  @override
  String get clearFilters => 'Filtreleri temizle';

  @override
  String get loading => 'Yükleniyor…';

  @override
  String get errorTitle => 'Bir şeyler ters gitti';

  @override
  String get errorMessage =>
      'Veriler yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.';

  @override
  String get timeJustNow => 'az önce';

  @override
  String timeMinutesAgo(int count) {
    return '$count dk önce';
  }

  @override
  String timeHoursAgo(int count) {
    return '$count sa önce';
  }

  @override
  String timeDaysAgo(int count) {
    return '$count gün önce';
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
    return '$count sa';
  }

  @override
  String durationMinutes(int count) {
    return '$count dk';
  }

  @override
  String durationHoursMinutes(int hours, int minutes) {
    return '$hours sa $minutes dk';
  }

  @override
  String get loginTitle => 'Tekrar hoş geldiniz';

  @override
  String get loginSubtitle => 'Devam etmek için giriş yapın';

  @override
  String get emailLabel => 'E-posta';

  @override
  String get passwordLabel => 'Şifre';

  @override
  String get emailRequired => 'Lütfen e-postanızı girin';

  @override
  String get emailInvalid => 'Lütfen geçerli bir e-posta adresi girin';

  @override
  String get passwordRequired => 'Lütfen şifrenizi girin';

  @override
  String get passwordTooShort => 'Şifre en az 6 karakter olmalıdır';

  @override
  String get signIn => 'Giriş yap';

  @override
  String get showPassword => 'Şifreyi göster';

  @override
  String get hidePassword => 'Şifreyi gizle';

  @override
  String get invalidCredentials => 'E-posta veya şifre hatalı';

  @override
  String get networkError => 'Ağ hatası. Lütfen tekrar deneyin.';

  @override
  String get demoAccounts => 'Demo hesaplar';

  @override
  String get demoAccountsHint => 'Formu doldurmak için bir hesaba dokunun';

  @override
  String get roleCitizen => 'Vatandaş';

  @override
  String get roleMunicipality => 'Belediye';

  @override
  String get logout => 'Çıkış yap';

  @override
  String get logoutConfirmTitle => 'Çıkış yapılsın mı?';

  @override
  String get logoutConfirmMessage =>
      'Uygulamayı kullanmak için tekrar giriş yapmanız gerekecek.';

  @override
  String get navParking => 'Otopark';

  @override
  String get navMap => 'Harita';

  @override
  String get navReports => 'Bildirimler';

  @override
  String get navAssistant => 'Asistan';

  @override
  String get navProfile => 'Profil';

  @override
  String get navDashboard => 'Panel';

  @override
  String get navManage => 'Yönet';

  @override
  String get locationFallback =>
      'Konum kullanılamıyor. Üsküp merkezi çevresindeki sonuçlar gösteriliyor.';

  @override
  String get locationEnable => 'Etkinleştir';

  @override
  String get useMyLocation => 'Konumumu kullan';

  @override
  String get locating => 'Konumunuz bulunuyor…';

  @override
  String get parkingTitle => 'Yapay Zekâ Otopark';

  @override
  String get parkingSubtitle => 'Şu an sizin için sıralandı';

  @override
  String get rankingPreference => 'Sıralama tercihi';

  @override
  String get presetBalanced => 'Dengeli';

  @override
  String get presetClosest => 'En yakın';

  @override
  String get presetCheapest => 'En ucuz';

  @override
  String get presetAvailable => 'En çok yer';

  @override
  String get listView => 'Liste';

  @override
  String get mapView => 'Harita';

  @override
  String spotsFree(int available, int capacity) {
    return '$available/$capacity boş';
  }

  @override
  String get spotFull => 'Dolu';

  @override
  String get priceFree => 'Ücretsiz';

  @override
  String pricePerHour(String price) {
    return '$price/sa';
  }

  @override
  String scoreValue(int value) {
    return 'Puan $value';
  }

  @override
  String get topPick => 'En iyi seçim';

  @override
  String get whyThisSpot => 'Neden bu otopark?';

  @override
  String get factorDistance => 'Mesafe';

  @override
  String get factorAvailability => 'Müsaitlik';

  @override
  String get factorPrice => 'Fiyat';

  @override
  String get factorDemand => 'Bu saatteki talep';

  @override
  String get scoreExplanation =>
      'Puan; size olan mesafeyi, boş yerleri, fiyatı ve günün bu saatindeki beklenen talebi birleştirir.';

  @override
  String get parkingTypeStreet => 'Cadde';

  @override
  String get parkingTypeGarage => 'Kapalı otopark';

  @override
  String get parkingTypeLot => 'Açık otopark';

  @override
  String zoneLabel(String zone) {
    return 'Bölge $zone';
  }

  @override
  String get payAndPark => 'Öde ve park et';

  @override
  String get noSpotsTitle => 'Otopark bulunamadı';

  @override
  String get noSpotsMessage => 'Şu anda gösterilecek otopark yok.';

  @override
  String lastUpdated(String time) {
    return 'Güncellendi $time';
  }

  @override
  String get paymentTitle => 'Otopark ödemesi';

  @override
  String get selectDuration => 'Süre';

  @override
  String get plateLabel => 'Plaka';

  @override
  String get plateHint => 'SK 1234 AB';

  @override
  String get plateRequired => 'Lütfen plakanızı girin';

  @override
  String get plateInvalid => '4–10 harf ve rakam kullanın';

  @override
  String get paymentMethod => 'Ödeme yöntemi';

  @override
  String get paymentCard => 'Kart •••• 4242';

  @override
  String get paymentWallet => 'Mobil cüzdan';

  @override
  String get paymentSms => 'SMS ile park';

  @override
  String get totalLabel => 'Toplam';

  @override
  String payAmount(String amount) {
    return '$amount öde';
  }

  @override
  String get startFreeSession => 'Oturumu başlat';

  @override
  String get mockPaymentNotice => 'Demo modu: gerçek ödeme yapılmaz.';

  @override
  String get paymentSuccess => 'Ödeme başarılı. Oturumunuz başladı.';

  @override
  String get spotFullError => 'Bu otopark dolu. Lütfen başka birini seçin.';

  @override
  String get replaceSessionWarning =>
      'Yeni bir oturum başlatmak mevcut oturumunuzu sonlandırır.';

  @override
  String get activeSessionTitle => 'Park oturumu';

  @override
  String get timeRemaining => 'Kalan süre';

  @override
  String endsAt(String time) {
    return 'Bitiş $time';
  }

  @override
  String get extend => 'Uzat';

  @override
  String get endSession => 'Oturumu bitir';

  @override
  String get endSessionConfirm =>
      'Park oturumunuz şimdi sonlandırılsın mı? Kullanılmayan süre iade edilmez.';

  @override
  String get extendTitle => 'Oturumu uzat';

  @override
  String extendOption(String duration, String amount) {
    return '$duration ekle · $amount';
  }

  @override
  String get sessionExtended => 'Oturum uzatıldı';

  @override
  String get sessionEnded => 'Park oturumu sona erdi';

  @override
  String get sessionExpiredTitle => 'Park süresi doldu';

  @override
  String sessionExpiredMessage(String spot) {
    return '$spot oturumunuzun süresi doldu. Ceza almamak için aracınızı taşıyın veya yeni bir oturum başlatın.';
  }

  @override
  String get sessionWarningTitle => '10 dakika kaldı';

  @override
  String sessionWarningMessage(String spot) {
    return '$spot park sürenizin dolmasına 10 dakikadan az kaldı.';
  }

  @override
  String sessionBanner(String spot, String time) {
    return '$spot · $time kaldı';
  }

  @override
  String get viewSession => 'Görüntüle';

  @override
  String get noActiveSessionTitle => 'Aktif oturum yok';

  @override
  String get noActiveSessionMessage =>
      'Oturum başlatmak için bir otopark seçin.';

  @override
  String get amountPaid => 'Ödenen';

  @override
  String get startedAt => 'Başlangıç';

  @override
  String get sessionExpiredBadge => 'Süresi doldu';

  @override
  String get myReports => 'Bildirimlerim';

  @override
  String get newReport => 'Yeni bildirim';

  @override
  String get categoryLabel => 'Kategori';

  @override
  String get categoryPothole => 'Yol çukuru';

  @override
  String get categoryStreetlight => 'Arızalı sokak lambası';

  @override
  String get categoryGraffiti => 'Grafiti';

  @override
  String get categoryTrash => 'Çöp';

  @override
  String get categoryDamagedSign => 'Hasarlı tabela';

  @override
  String get categoryOther => 'Diğer';

  @override
  String get descriptionLabel => 'Açıklama';

  @override
  String get descriptionHint =>
      'Sorunu ve tam olarak nerede olduğunu açıklayın';

  @override
  String get descriptionRequired => 'Lütfen sorunu açıklayın';

  @override
  String get descriptionTooShort => 'Lütfen en az 10 karakter ekleyin';

  @override
  String get locationLabel => 'Konum';

  @override
  String get pickOnMap => 'Haritada seç';

  @override
  String get locationNotSet => 'Konum seçilmedi';

  @override
  String get locationRequired => 'Lütfen bir konum seçin';

  @override
  String get addPhoto => 'Fotoğraf ekle';

  @override
  String get photoAttached => 'Fotoğraf eklendi';

  @override
  String get removePhoto => 'Fotoğrafı kaldır';

  @override
  String get photoDemoNote => 'Demo modunda fotoğraf yükleme simüle edilir.';

  @override
  String get submitReport => 'Bildirimi gönder';

  @override
  String get reportSubmitted => 'Bildirim gönderildi. Teşekkürler!';

  @override
  String get noReportsTitle => 'Henüz bildirim yok';

  @override
  String get noReportsMessage =>
      'Mahallenizde bir sorun mu gördünüz? Bildirmek için + simgesine dokunun.';

  @override
  String get reportDetails => 'Bildirim ayrıntıları';

  @override
  String get statusLabel => 'Durum';

  @override
  String get statusSubmitted => 'Gönderildi';

  @override
  String get statusInReview => 'İnceleniyor';

  @override
  String get statusInProgress => 'Devam ediyor';

  @override
  String get statusResolved => 'Çözüldü';

  @override
  String get priorityLabel => 'Öncelik';

  @override
  String get priorityLow => 'Düşük';

  @override
  String get priorityMedium => 'Orta';

  @override
  String get priorityHigh => 'Yüksek';

  @override
  String get priorityCritical => 'Kritik';

  @override
  String reportedOn(String date) {
    return 'Bildirim tarihi $date';
  }

  @override
  String get neighborhoodLabel => 'Mahalle';

  @override
  String get progressLabel => 'İlerleme';

  @override
  String get municipalityNotes => 'Belediyeden güncellemeler';

  @override
  String get noNotes => 'Henüz güncelleme yok';

  @override
  String get pickLocationTitle => 'Konum seçin';

  @override
  String get tapToPlace => 'İşaret koymak için haritaya dokunun';

  @override
  String get confirmLocation => 'Konumu onayla';

  @override
  String get photoLabel => 'Fotoğraf';

  @override
  String get manageReports => 'Bildirimleri yönet';

  @override
  String get filterStatus => 'Durum';

  @override
  String get filterCategory => 'Kategori';

  @override
  String get filterPriority => 'Öncelik';

  @override
  String get filterNeighborhood => 'Mahalle';

  @override
  String get sortNewest => 'En yeni önce';

  @override
  String get sortPriority => 'En yüksek öncelik';

  @override
  String get assignTo => 'Ata';

  @override
  String get assigneeLabel => 'Sorumlu';

  @override
  String get unassigned => 'Atanmamış';

  @override
  String assignedTo(String name) {
    return '$name kişisine atandı';
  }

  @override
  String get changeStatus => 'Durumu değiştir';

  @override
  String get noStatusChanges => 'Başka durum değişikliği yok';

  @override
  String get notesLabel => 'Notlar';

  @override
  String get addNote => 'Not ekle';

  @override
  String get noteHint => 'Ekip ve vatandaş için bir not yazın…';

  @override
  String get noteAdded => 'Not eklendi';

  @override
  String get reportUpdated => 'Bildirim güncellendi';

  @override
  String get invalidTransition => 'Bu durum değişikliğine izin verilmiyor';

  @override
  String get noMatchingTitle => 'Eşleşen bildirim yok';

  @override
  String get noMatchingMessage =>
      'Filtreleri değiştirmeyi veya temizlemeyi deneyin.';

  @override
  String reportsCount(int count) {
    return '$count bildirim';
  }

  @override
  String get createdLabel => 'Oluşturulma';

  @override
  String get departmentRoads => 'Yollar';

  @override
  String get departmentLighting => 'Aydınlatma';

  @override
  String get departmentSanitation => 'Temizlik';

  @override
  String get departmentPublicSpaces => 'Kamusal alanlar';

  @override
  String get cityMapTitle => 'Şehir haritası';

  @override
  String get layersLabel => 'Katmanlar';

  @override
  String get layerParking => 'Otopark';

  @override
  String get layerReports => 'Bildirimler';

  @override
  String get availabilityHigh => 'Bol yer var';

  @override
  String get availabilityMedium => 'Sınırlı';

  @override
  String get availabilityLow => 'Neredeyse dolu';

  @override
  String get availabilityNone => 'Dolu';

  @override
  String get mapAttribution => 'OpenStreetMap katkıcıları';

  @override
  String clusterZoomHint(int count) {
    return 'Burada $count öğe var. Görmek için yakınlaştırın.';
  }

  @override
  String get dashboardTitle => 'Şehir paneli';

  @override
  String greeting(String name) {
    return 'Merhaba, $name';
  }

  @override
  String get kpiOpenReports => 'Açık bildirimler';

  @override
  String get kpiAvgResolution => 'Ort. çözüm süresi';

  @override
  String get kpiOccupancy => 'Otopark doluluğu';

  @override
  String get kpiRevenue => 'Bugünkü gelir';

  @override
  String valueHours(String value) {
    return '$value sa';
  }

  @override
  String valueDays(String value) {
    return '$value gün';
  }

  @override
  String get notAvailable => 'yok';

  @override
  String get chartByCategory => 'Kategoriye göre bildirimler';

  @override
  String get chartOverTime => 'Son 14 gündeki bildirimler';

  @override
  String get chartOccupancyByHour => 'Saate göre otopark doluluğu (%)';

  @override
  String get aiInsights => 'Yapay zekâ öngörüleri';

  @override
  String get noInsights => 'Şu anda dikkat çeken bir eğilim yok.';

  @override
  String get reportManagement => 'Bildirim yönetimi';

  @override
  String get viewAll => 'Tümünü gör';

  @override
  String insightSpike(String category, String neighborhood, int percent) {
    return '$neighborhood bölgesinde $category bu hafta %$percent arttı';
  }

  @override
  String insightDrop(String category, int percent) {
    return '$category bildirimleri bu hafta şehir genelinde %$percent azaldı';
  }

  @override
  String insightHotspot(String neighborhood, int count) {
    return 'En çok açık bildirim $neighborhood bölgesinde ($count)';
  }

  @override
  String insightUnassigned(int count) {
    return '$count yüksek öncelikli bildirim hâlâ atanmadı';
  }

  @override
  String insightSlowResolution(String category, String days) {
    return '$category: ortalama $days günde çözülüyor';
  }

  @override
  String insightPeakOccupancy(String hour, int percent) {
    return 'Otopark talebi $hour civarında %$percent ile zirve yapıyor';
  }

  @override
  String insightFullParking(int count) {
    return '$count otopark %90\'ın üzerinde dolu';
  }

  @override
  String get assistantTitle => 'Şehir asistanı';

  @override
  String get assistantSubtitle => 'Otopark, trafik ve şehir hizmetleri';

  @override
  String get assistantWelcome =>
      'Merhaba! Ben UrbanFlow asistanınızım. Bana otopark, trafik veya şehir hizmetleri hakkında soru sorun.';

  @override
  String get messageHint => 'Şehir hakkında her şeyi sorun…';

  @override
  String get assistantTyping => 'Asistan yazıyor…';

  @override
  String get clearChat => 'Sohbeti temizle';

  @override
  String get qrFindParking => 'Yakınımda otopark bul';

  @override
  String get qrParkingPrice => 'Otopark fiyatları';

  @override
  String get qrTraffic => 'Şu anki trafik';

  @override
  String get qrReportIssue => 'Sorun nasıl bildirilir?';

  @override
  String get qrMyReports => 'Bildirimlerimin durumu';

  @override
  String get qrCityHours => 'Belediye çalışma saatleri';

  @override
  String get qrEmergency => 'Acil durum numaraları';

  @override
  String get aiGreeting => 'Merhaba! Bugün size nasıl yardımcı olabilirim?';

  @override
  String get aiThanks =>
      'Rica ederim! Başka bir konuda yardımcı olabilir miyim?';

  @override
  String get aiFallback =>
      'Anladığımdan emin değilim. Otopark, trafik, bildirimler ve şehir hizmetleri konusunda yardımcı olabilirim.';

  @override
  String aiParkingBest(String name, String distance, int free, String price) {
    return 'Şu an yakınınızdaki en iyi seçenek: $name, $distance uzaklıkta, $free boş yer, $price.';
  }

  @override
  String get aiParkingNone =>
      'Şu anda yakında boş otopark bulamadım. Birkaç dakika sonra tekrar deneyin.';

  @override
  String aiParkingPrices(String zoneA, String zoneB, String zoneC) {
    return 'Üsküp\'te kamu otoparkları bölgeye göre ücretlendirilir: A Bölgesi $zoneA, B Bölgesi $zoneB, C Bölgesi $zoneC saatlik. Birçok AVM otoparkı ücretsizdir.';
  }

  @override
  String aiSessionActive(String name, String time) {
    return '$name oturumunuzun bitmesine $time kaldı.';
  }

  @override
  String get aiSessionNone => 'Aktif bir park oturumunuz yok.';

  @override
  String aiTrafficHeavy(String streets) {
    return 'Trafik şu anda yoğun, özellikle $streets üzerinde. Ekstra zaman ayırın.';
  }

  @override
  String aiTrafficModerate(String streets) {
    return 'Trafik orta yoğunlukta. $streets üzerinde gecikmeler bekleyin.';
  }

  @override
  String get aiTrafficLight => 'Şu anda şehir genelinde trafik akıcı.';

  @override
  String get aiReportHowTo =>
      'Bildirimler\'i açın, + simgesine dokunun, bir kategori seçin, sorunu açıklayın ve konumu haritada işaretleyin. Durumunu Bildirimlerim bölümünden takip edebilirsiniz.';

  @override
  String aiReportStatus(int total, int open, int resolved) {
    return '$total bildiriminiz var: $open açık ve $resolved çözüldü.';
  }

  @override
  String get aiReportStatusNone => 'Henüz hiç bildirim göndermediniz.';

  @override
  String get aiCityHours =>
      'Üsküp Belediyesi ofisleri pazartesiden cumaya 08:00–16:00 arası açıktır. Birçok hizmet çevrimiçi de sunulmaktadır.';

  @override
  String get aiEmergency =>
      'Kuzey Makedonya acil durum numaraları: 112 genel acil, 192 polis, 193 itfaiye, 194 ambulans.';

  @override
  String get aiTransport =>
      'Şehir otobüsleri yaklaşık 05:00–23:00 arası çalışır. Ana duraklar Ulaşım Merkezi ve şehir merkezindeki duraklardır.';

  @override
  String get aiWaste =>
      'Çöpler merkezi bölgelerde her gün, diğer bölgelerde haftada iki üç kez toplanır. Taşan konteynerleri Bildirimler\'den bildirin.';

  @override
  String get settingsTitle => 'Profil ve ayarlar';

  @override
  String get signedInAs => 'Giriş yapan';

  @override
  String get appearance => 'Görünüm';

  @override
  String get themeSystem => 'Sistem';

  @override
  String get themeLight => 'Açık';

  @override
  String get themeDark => 'Koyu';

  @override
  String get languageLabel => 'Dil';

  @override
  String get aboutLabel => 'Hakkında';

  @override
  String get aboutText =>
      'UrbanFlow AI, Üsküp vatandaşlarının ve belediyesinin şehri hareket halinde tutmasına yardımcı olur.';

  @override
  String versionLabel(String version) {
    return 'Sürüm $version';
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
  String get scoreLabel => 'Puan';
}
