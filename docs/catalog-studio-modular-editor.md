# Katalog Stüdyosu: sayfa planı ve modüler görsel editör

## Amaç
Küçük kategorileri aynı PDF sayfasında ayrı başlıklarla göstermek; sayfa planını sade tutarken ayrıntılı düzenlemeyi ayrı bir görsel editörde sunmak. Ürün başlığı, tam SKU, kısa açıklama ve teknik özellikler korunur. Kaynak ürünler değişmez.

## Araştırma ve karar
- [GrapesJS Block Manager](https://grapesjs.com/docs/modules/Blocks) bileşen tabanlı blok tanımlarını önerir. Katalog için başlık + ürün grubu gibi yapılandırılmış modüller bu yaklaşımı karşılar.
- [GrapesJS Components](https://grapesjs.com/docs/modules/Components) model ile görünümü ayırır. Mevcut katalog JSON modeli, geçmiş ve sunucu render hattı korunacak; ikinci bir HTML proje modeli ve ek editör bağımlılığı eklenmeyecek.
- [W3C CSS Fragmentation](https://www.w3.org/TR/css-break-3/) sayfa kırılmalarını tanımlar; kesin kırılma noktalarını garanti etmez. Bu nedenle mevcut Chromium ölçümü devam eder; yalnızca CSS break-inside kurallarına güvenilmez.

## Kullanım
1. **Sayfa planı:** sayfa sırası, ürün/bölüm sayıları, başlıklar, bir sonraki ürün sayfasıyla başlıkları koruyarak birleştirme, ayırıcılar ve görsel editöre geçiş.
2. **Görsel editör:** seçili sayfada ürün grubu modülleri, modül başlığı/açıklaması, sütun ve satır yerleşimi, ürün taşıma, modül sırası, ekleme/kaldırma, geniş çalışma alanı.
3. **Önizleme:** sunucuda ölçülmüş gerçek baskı sonucu. Görsel editör canlı bir taslaktır; taşma durumunda PDF ek sayfa oluşturabilir.

## Veri ve geriye uyumluluk
- Mevcut sayfa productIds listesi ürün üyeliğini belirlemeye devam eder.
- İsteğe bağlı sections alanı bu ürünleri başlıklı ve sıralı gruplara böler.
- Eski şablonlar değişmeden açılır. Bölüme ayrılmamış ürünler son gruba eklenir; geçersiz/tekrar eden atamalar tekilleştirilir.
- Birleştirme bölüm başlıklarını korur. Bölme, taşıma ve PDF sayfalarını sabitleme bölüm üyeliğini yeni ürün listesine göre uzlaştırır.
- Bölüm kaldırmak ürünleri havuza çıkarır; geri al ile geri getirilebilir.
- İstemci ve sunucu aynı plan yardımcılarını kullanır. Bölüm metinleri düz metindir ve PDF HTML çıktısında escape edilir.

## Baskı davranışı
Her bölüm kendi başlığı, açıklaması ve kart ızgarasıyla ölçülür. Kullanılabilir alan içerik ihtiyacına göre paylaştırılır. Başlık ürünsüz bırakılmaz. Sığmayan ürünler bölüm başlığı tekrarlanarak sonraki sayfaya taşınır. İçindekilerde aynı sayfayı paylaşan iki kategori aynı sayfa numarasıyla yer alır. Çok uzun tek ürün mevcut teknik bilgi devam sayfası mekanizmasını kullanır.

## Doğrulama
Eski planlar, çok başlıklı birleştirme, bölüm taşıma/bölme, ürün tekilliği ve şema sınırları birim testleriyle kontrol edilir. Gerçek Safir/DHI ürünlerinden PDF oluşturulur; başlıklar, SKU ve ürün sayıları, içindekiler, A4/A5 taşma davranışı kontrol edilir. Arayüzde sekmeler, modül düzenleme, geri al ve kaydetme denenir.

## Sınır
Bu sürüm ürün grubu modüllerine odaklanır. Serbest koordinatlı çizim, katmanlar ve bağımsız dekoratif görsel/metin modülleri bu veri modelinin üzerine ayrı bir genişletme olarak eklenebilir. Kapak düzenleyicisi korunur.

## Tamamlanan doğrulama · 20 Kasım 2026
- 32 katalog birim testi, TypeScript, değişen dosyalarda ESLint ve üretim derlemesi başarılı.
- Safir ve Bıçak Tutucular (123, 125) + DHI (19, 20): iki kategori, dört ürün tek A4 ürün sayfasında. İçindekiler iki başlık için de aynı sayfa numarasını gösteriyor.
- A4/A5 × dikey/yatay × ızgara/satır: sekiz baskı senaryosunda ürün kaybı yok; küçük kağıtlarda devam sayfaları oluşuyor.
- Dokuz ürün / üç modül, otomatik alan paylaşımı açık ve kapalı; 80 özellikli ürün devamı doğrulandı.
- Gerçek API üzerinden kayıt, önizleme, geçersiz sütun sayısının reddi, PDF kuyruğu, yetkili indirme ve anonim isteğin reddi başarılı.
- Arayüzde ayrı sekmeler, başlıkları koruyan birleştirme, bölmede boş grupların temizlenmesi, bölüm sürükleme, yukarı/aşağı taşıma, ürünleri gruplar arasında taşıma, yeni grup, geri al ve kaydetme doğrulandı. Açık/koyu tema incelendi.
- Yerel örnek: “Modüler · Safir ve DHI”. PDF: output/pdf/catalog-sapphire-dhi.pdf. Safir kaynak görselindeki düşük çözünürlük uyarısı korunuyor.