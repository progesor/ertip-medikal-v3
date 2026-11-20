# Katalog Stüdyosu — tam kod ve sayfa atölyesi
20 Kasım 2026

## Kod gösterimi
Ürünün ana SKU'su varsa aynen kullanılır. Ana kod yoksa ilk aktif ve boş olmayan varyasyon SKU'su tam olarak gösterilir; prefix veya ortak kodun devamı üç nokta ile kısaltılmaz. Gerçek ana kod ile karışmaması için “Örnek varyant kodu / Example variant code” etiketi bulunur. Yoğun kartlarda da kod 8,5 punto, koyu ve satır kırılmasına izin veren biçimde gösterilir. Kaynak ürün ve varyasyon kayıtları değiştirilmez.

## Sayfa atölyesi
- Sayfa şeridi: ürün görsellerinden oluşan küçük sayfalar, bölüm kapakları, seçili sayfa ve sürükleyerek sıralama.
- Seçili sayfa: görselli ürün kartları; karta tıklayarak sağ panelde kataloğa özel isim, kod, kısa açıklama ve görsel düzenleme.
- Taşıma: ürün sürükleme, sıra düğmeleri, çoklu seçim ve toplu sayfaya taşıma. Ürün aynı katalogda ikinci kez yerleştirilmez.
- Ürün havuzu: yerleştirilmeyenler, yerleştirilenleri de gösterme, ad/tam kod arama ve seçili sayfaya ekleme.
- Sayfa işlemleri: boş tasarım kopyası, seçilen ürünlerle veya ortadan bölme, sonraki ürün sayfasıyla birleştirme, yukarı/aşağı taşıma ve kaldırma. Kaldırılan sayfanın ürünleri havuza döner; bölüm ayracının üzerinden birleştirme yapılmaz.
- Sayfa görünümü: kart/satır/vitrin, hedef yoğunluk, %60–100 görsel ölçeği, vurgu rengi, kısa açıklama ve temel özellik sayısı. Genel ayarlara dönüş vardır.
- PDF bağlantısı: “PDF'de gör” güncel önizlemeyi hazırlayıp ilgili gerçek sayfayı açar. “Önizlemedeki sayfaları sabitle” ölçülmüş grupları elle düzenlenebilir sayfalara dönüştürür; kapak ve içindekiler plana eklenmez, devam sayfaları ürünü çoğaltmaz.
- Geri/ileri alma bütün plan değişikliklerini kapsar. Ctrl/Cmd+S kaydeder; metin alanı dışında Ctrl/Cmd+Z ve Shift+Z geri/ileri alır. Otomatik moda dönmek saklı manuel sayfaları silmez.

Atölye yapısal bir görsel düzenleyicidir; serbest koordinatlı çizim aracı değildir. Kart görünümü taslaktır, kesin baskı yerleşimi PDF önizlemesidir. Uzun içerik ek sayfaya taşınabilir. Elle seçilen kart/satır düzeni otomatik olarak başka düzene çevrilmez; tek ürüne düşen sayfa vitrin olarak hazırlanır. “Tüm teknik bilgiler” açıkken sayfa özellik limiti uygulanmaz.

Kataloğa özel düzenlemeden sonra önizleme yenilense bile kaynak başlık/kod/metin/görsel ayrı tutulur. “Kaynak bilgilerini kullan” bunlara geri döner.

## Doğrulama
27 birim testi: ilk aktif tam kod, sayfa görünümü doğrulaması, toplu taşıma, bölme/birleştirme, ölçülen planı sabitleme ve önceki kaynak güvenliği testleri. TypeScript, ESLint ve production build kontrol edildi. 20 A4/A5 yön/yoğunluk kombinasyonu ve 80 özellikli devam sayfası testi geçti. 139 ürünün tam kodlarla kısa kataloğu 32, kompakt rehberi 18 sayfa; ürünler eksiksiz ve tekrarsız.

6 ve 9 hedefli punch/penset PDF'leri ve 4 sayfalık elle düzenleme örneği görsel olarak incelendi. Yerelde “Atölye · Elle Düzenleme Örneği” şablonu eklendi. Çalışma yeni migration gerektirmez; uzak sunucuya yayın yapılmamıştır.

Yerel adres: http://127.0.0.1:3020/admin/collections/catalogs/studio
