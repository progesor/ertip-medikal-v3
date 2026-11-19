# Katalog Stüdyosu — yerel doğrulama

19 Kasım 2026. Geliştirme dalı: `codex/catalog-studio`.
Çalışma dizini: `C:/Users/proge/WebstormProjects/ertipweb/ertip-test-local`.

## Kullanıcı testi

Yerel adres: http://127.0.0.1:3020/admin/collections/catalogs/studio

1. Kayıtlı çalışmalardan **Ertıp Seçkisi · İlk Katalog** çalışmasını açın.
2. **Çoğalt** ile kendi denemenizi oluşturun.
3. Tüm yayındaki ürünler / kategori / seçtiğim ürünler kaynaklarından birini seçin.
4. **Kısa açıklama**, **Teknik özellikler** ve gerekirse **Ölçü ve seçenek özeti** seçeneklerini kullanın. Web sitesinin uzun açıklaması alınmaz. Her kombinasyon için ayrı satır oluşturulmaz.
5. Tasarım ve kapak sekmelerini değiştirip **Önizle** ile sayfa sayısını ve uyarıları inceleyin.
6. **PDF oluştur** sonrasında PDF arşivinde **Hazır** durumunu bekleyin ve indirin.
7. Türkçe/İngilizce, farklı yoğunluklar ve kendi ürün seçkiniz için görsel değerlendirme yapın.

Yoğunluk, sayfadaki kart yuvası sayısıdır. Çok uzun teknik tablolar devam kartına taşınabilir. Kaynak ürünler katalogdaki metin değişikliklerinden etkilenmez. Oluşturulan PDF, üretildiği andaki içerik ve tasarımı korur.

## Tamamlanan otomatik ve yerel kontroller

- Katalog ve mevcut içerik kontrolü testleri: 11 test geçti.
- TypeScript kontrolü, yeni kodda ESLint ve production build geçti.
- A4/A5 × dikey/yatay × 1/2/4/6/9 kart: 20 yerleşim kombinasyonu gerçek ürünlerle denendi.
- 139 yayındaki ürünle İngilizce kompakt katalog üretildi; 26 sayfa, yaklaşık 4 MB. İçerik kontrolü 4 uyarı buldu.
- Crown, Luxury koltuk, 55 varyasyonlu punch ve pensetlerle gerçek PDF üretildi; sayfalar görsel olarak incelendi.
- Punch'ın 55 kombinasyonu yalnızca çap ve uzunluk özetlerine indirgeniyor. Kapalı seçenekler çıkarılıyor.
- Panelde kayıt açma, kaydetme, önizleme, PDF kuyruğu ve tamamlanan dosya doğrulandı.
- Anonim çalışma erişimi 401, anonim PDF erişimi 403; yetkili PDF indirme 200 ve geçerli PDF imzası.
- Geçersiz tasarım 400, özel istek başlığı olmayan yazma 403, eski çalışma sürümüyle kaydetme 409.
- Açık ve koyu yönetim temaları masaüstü görünümünde incelendi.
- Migration yerel geri yüklenmiş veritabanına uygulandı. Öncesinde SQL yedeği alındı.
- Çıktılar `media/catalog-pdfs` altında, mevcut medya/tam yedekleme kapsamındadır. Kullanılan görseller gerçek upload ilişkileriyle korunur.

## Çalıştırma ve dağıtım

Linux sunucuda Chromium varsayılan yolu `/usr/bin/chromium`. Farklı bir kurulumda `CATALOG_CHROMIUM_PATH` ayarlanır. Windows yerel testinde kurulu Playwright Chromium yolu bu değişkenle verilmiştir. `playwright-core` kendi tarayıcısını indirmez.

Railpack runtime paketlerine Chromium ve font paketi eklendi. Paket yapılandırması [Railpack belgelerine](https://railpack.com/guides/installing-packages/) göre hazırlanmıştır. Linux/Coolify üzerinde PDF üretimi henüz çalıştırılmadı; yayın sonrasında bir örnek üretimle doğrulanmalıdır.

İş kuyruğu çalışan Node sunucusunda her 10 saniyede kontrol edilir. Aynı süreçte önceki kontrol sürerken yenisi başlamaz. Bu sürüm tek uygulama instance'ı hedefler. Çoklu replica için ortak eşzamanlılık sınırlaması ayrıca eklenmelidir.

## Sonraki aşamalar

Sayfa/bölüm bazında karma düzen, serbest nesne sürükleme, kategori ayırıcıları, içindekiler, gelişmiş kadraj ve tipografi, kaynak değişikliklerini karşılaştırma, QR ve MCP araçları sonraki aşamalardır. Mevcut sürüm şablon ve ayar tabanlı bir editördür. CMYK/PDF-X matbaa çıktısı henüz kapsamda değildir.

Sunucu kapanırken yarım kalan işlerin otomatik kurtarılması ilk sürümde yoktur; tekrar üretim yeni bir çıktı oluşturur. Aynı tamamlanmış iş yeniden çalıştırılırsa mevcut PDF korunur.
