# Ertıp Katalog Stüdyosu geliştirme planı

19 Kasım 2026

## Amaç

Yönetim panelinde mevcut ürünlerden Türkçe ve İngilizce katalog, broşür ve kompakt ürün listesi hazırlamak. Kullanıcı ürünleri seçer, tasarımı düzenler, çalışmasını saklar ve PDF sürümlerini indirir. İlk kullanılabilir sürüm aşağıda tanımlanan ilk iki aşamayı kapsar.

## Kullanıcı akışı

1. Çalışmayı adlandır ve belge dilini seç.
2. Yayındaki tüm ürünleri, kategori ve alt kategorileri veya belirli ürünleri seç.
3. A4 ya da A5, dikey ya da yatay sayfa biçimini ve tasarım ailesini belirle.
4. Kapak, ürün sırası, görseller ve gösterilecek alanları düzenle.
5. Eksik içerik ve yerleşim uyarılarını incele.
6. PDF oluştur. İşin durumunu ve önceki çıktıları çalışma ekranından takip et.

## Editör ve tasarım

Sol bölüm ürün havuzunu ve sayfa sırasını, orta bölüm belge önizlemesini, sağ bölüm seçilen ayarları gösterir. Kaydetme, geri alma, ileri alma ve PDF üretimi üst alanda bulunur. Yönetim panelinin açık ve koyu teması mevcut CSS değişkenlerini kullanır. Katalog renkleri çalışmaya özel saklanır.

Kurumsal tema açık zemin ve teknik tabloları, premium tema büyük görseller ve koyu kapakları, kompakt tema yoğun ürün yerleşimini esas alır. Ana renk, yazı tipi, görsel kadrajı, boşluklar, altbilgi ve sayfa numarası düzenlenebilir.

Kapak seçenekleri ürün görseli, kolaj ve tipografik kapaktır. Arka kapak ve kategori ayırıcıları aynı tasarım ailesini izler. Kullanıcı çalışmayı şablon olarak çoğaltabilir.

## Sayfa düzenleri

| Düzen         | İçerik                                                                     |
| ------------- | -------------------------------------------------------------------------- |
| 1 ürün        | Büyük görsel, ayrıntılı açıklama, teknik özellikler, aktif varyant tablosu |
| 2 ürün        | Yarım sayfalık ürün tanıtımları                                            |
| 4 ürün        | Görsel, özet, SKU ve seçilen özellikler                                    |
| 6 veya 9 ürün | Temel bilgilerle kompakt kartlar                                           |
| Teknik tablo  | Ürün veya varyant satırları                                                |
| Tanıtım       | Metin, görsel, logo ve renkli alanlar                                      |
| Karşılaştırma | Seçilen ürünlerin ortak özellikleri                                        |

Bölüm ve ürün bazında düzen değiştirilebilir. Uzun içerikler devam sayfasına taşınır. Taşma ve düşük çözünürlük görünür uyarı üretir. Tablo başlıkları devam sayfalarında tekrarlanır.

## İçerik ilkeleri

19 Kasım kullanıcı kararı: Kataloglarda kısa ürün açıklaması ve teknik özellikler esas alınır. Web sitesindeki uzun detay açıklaması kullanılmaz. Kataloğa özel kısa metin düzenlenebilir; ölçü ve seçenek özeti isteğe bağlıdır.

İkinci kullanıcı kararı: 55 ölçü kombinasyonu olan punch gibi ürünler tek ana ürün kartıyla gösterilir. Aktif seçenekler çap, uzunluk, renk, kolçak gibi başlıklarda özetlenir. Her varyant için ayrı satır veya sayfa oluşturulmaz.

Ürün adı, kısa açıklama, SKU, görseller, teknik özellikler, ölçüler, paket bilgileri ve aktif seçenek grupları kaynak kayıtlardan alınır. Alan görünürlüğü çalışma bazında seçilir. Kataloğa özel metinler ve görsel seçimleri ayrı saklanır. Kaynak ürünün güncelleme zamanı kaydedilir; değişiklikleri yeniden alma işlemi bilinçli yapılır.

İngilizce eksikler Türkçe fallback kapalıyken tespit edilir. Kullanıcı katalogda metin girebilir, ürünü çıkarabilir veya Türkçe içeriği kullanmayı seçebilir. Koltuklarda standart konfigürasyon ile kol, başlık ve kumanda seçenekleri; pensetlerde SKU ve ölçüler; Crown cihazında büyük görseller desteklenir.

## Kalite kontrolü

Eksik SKU, görsel ve çeviri; sayfa taşması; düşük çözünürlük; boş sayfa; yinelenen seçim ve yayından kaldırılmış ürünler kontrol edilir. İlk PDF örneği Crown, bir koltuk ve penset grubuyla hazırlanır. TR/EN, A4/A5 ve yoğun düzenler yerel testlerde değerlendirilir.

## Teknik tasarım

- Katalog çalışmaları ve PDF çıktıları ayrı Payload koleksiyonları olarak saklanır.
- Düzen şeması doğrulanır ve sürümlenir. Kullanıcı girdileri çalıştırılabilir HTML veya CSS olarak kabul edilmez.
- Seçilen ürün verileri PDF işi başlatıldığında snapshot olarak saklanır.
- Sunucuda HTML/CSS ve Chromium ile PDF oluşturulur. Editör aynı belge renderer'ını kullanır.
- Payload iş kuyruğu uzun PDF işlemlerini yürütür. Yeniden denemeler aynı çıktı kaydını kullanır.
- İş durumu, hata ve indirme ekranı panelden erişilebilir.
- Çıktılar kalıcı medya alanında yetkili bir koleksiyonda tutulur. Tam ve medya yedekleri bunları içerir.
- Kaynak görseller gerçek upload ilişkileriyle kaydedilir. Kullanılmayan medya taraması katalog bağlantılarını da görür.
- İçerik yöneticileri katalog oluşturur ve indirir. İş uçları kullanıcı yetkisini ve cross-origin istekleri kontrol eder.
- Serbest uzak URL'ler PDF tarayıcısına verilmez. Medya yerel dosyalardan, doğrulanmış kayıtlar üzerinden hazırlanır.
- Yerel Next.js belgeleri ve mevcut admin entegrasyon kuralları uygulanır.
- Ürün kataloğu ve teklif sepetinin statik uygulama rotaları korunur. QuoteRequests ve DownloadLogs iş mantığına müdahale edilmez.

## PDF profilleri

Dijital paylaşım daha küçük görseller ve tıklanabilir ürün bağlantıları kullanır. Yüksek kaliteli çıktı daha yüksek görsel çözünürlüğü ve gömülü fontlar kullanır. CMYK, PDF/X ve matbaa taşma payı ayrı bir doğrulama aşamasıdır.

## Aşamalar ve kabul ölçütleri

### 1. Tasarım ve çıktı doğrulaması

Crown, koltuk ve pensetlerle kapaklı PDF; Türkçe karakterler; gerçek görseller; uzun metin, tablo ve sayfa sonlarının görsel kontrolü.

### 2. Kullanılabilir ilk sürüm

Kayıtlı çalışmalar, şablon çoğaltma, ürün/kategori seçimi, üç tema, kapak, A4/A5 ve 1/2/4/6/9 ürün düzenleri. Alan görünürlüğü, sıralama, katalog metni değişiklikleri, önizleme, kuyrukta PDF üretimi ve sürüm indirme. Kalıcı çıktı depolama, ilişkili medya koruması, migration ve yetki testleri.

### 3. Gelişmiş düzenleme

Sayfa ve bölüm bazında farklı düzenler, sürükleme ve hizalama, serbest kapak nesneleri, kategori ayırıcıları, otomatik içindekiler, tablo sütunu seçimi, varyant seçimi, karşılaştırma, görsel kadrajı ve gelişmiş tipografi.

### 4. Sürüm ve entegrasyon

Ürün değişikliklerini alan bazında karşılaştırma, daha kapsamlı sürüm geçmişi, QR kodları, toplu dil çıktıları ve yetkili MCP araçları. MCP aynı katalog hizmetlerini çağırır. Matbaa çıktısı bu aşamada ayrıca değerlendirilir.

## Doğrulama

Şema ve seçim testleri; taslak/pasif varyant filtreleri; erişim reddi; sıradaki ve tekrar çalışan işler; çıktı dosyasının backup kapsamında kalması. Gerçek ürünlerle tam katalog üretimi ve örnek PDF sayfalarının PNG olarak incelenmesi. Önizlemenin PDF ile aynı sayfaları göstermesi. Kullanıcıya çalışan test adresi ve örnek PDF'ler sunulur.

## Kaynaklar

- https://playwright.dev/docs/api/class-page#page-pdf
- https://payloadcms.com/docs/jobs-queue/overview
