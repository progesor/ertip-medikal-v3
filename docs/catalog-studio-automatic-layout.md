# Katalog Stüdyosu — otomatik yayın yerleşimi
20 Kasım 2026

## Amaç
Ürün seçildikten sonra PDF üzerinde ayrı bir tasarım düzenlemesine ihtiyaç duymayan, okunaklı katalog ve broşür çıktıları. Gelişmiş görsel sayfa editörü bu aşamanın dışında bırakıldı.

## Kullanım
Tasarım sekmesinde dört başlangıç düzeni bulunur:
- Kısa ürün kataloğu: bölüm başlıkları, kısa açıklama, 4 temel teknik bilgi ve sayfada en fazla 6 ürün.
- Kompakt ürün rehberi: kesintisiz ürün akışı, açıklamasız görsel/kod/3 temel özellik ve sayfada en fazla 9 ürün.
- Ürün broşürü: kapaksız, içindekilersiz; sayfada 2 ürün hedefi ve geniş görseller.
- Vitrin koleksiyonu: seçilen vitrin ürünleri tam sayfa; diğer ürünler 4 ürün hedefiyle yerleştirilir.

Hazır düzen ürün seçimini, renkleri ve kataloğa özel düzeltmeleri korur. Otomatik sayfa modunu etkinleştirir; mevcut elle hazırlanmış sayfa planı verisini silmez. İşlem geri alınabilir. Görsel tema değişimi ürün yoğunluğunu artık değiştirmez. Öne çıkan ürünler yalnızca katalog kapsamındaysa ve otomatik mod açıksa eklenir; ikinci kez listelenmez.

## Görsel ve sayfa davranışı
Görsel Optimizasyonu global ayarlarındaki boyutlar snapshot'a kaydedilir. Bu yerel veritabanında ölçüler 384 / 768 / 1440 / 2400 pikseldir; sabit katalog değerleri kullanılmaz. Sayfadaki kullanım genişliği ve çıktı profili (dijital 160, kaliteli 300 hedef DPI) için uygun ölçü seçilir. Aynı görsel kapakta ve kartta kullanılıyorsa büyük ihtiyaca göre hazırlanır. Görsel büyütülmez. Kaynak dosya korunur; katalog kopyasında beyaz kenarlar kırpılır. Yeniden sıkıştırma kaybını azaltmak için web türevini tekrar sıkıştırmak yerine asıl dosyadan aynı profil ölçülerinde PDF görseli üretilir.

Yerleşim gerçek font, metin ve görseller yüklendikten sonra ölçülür. Aynı satırda başlık ve görsel yükseklikleri hizalanır. Son satırdaki 2 kart satır genişliğini paylaşır. İki ve üç ürünlü dikey sayfalarda görsel ile bilgi yan yana; tek ürünlü vitrin sayfasında büyük görsel ve altında iki sütunlu teknik tablo kullanılır.

Yoğunluk kesin sayfa kapasitesi değildir. En az yaklaşık 20 mm görsel alanı ve okunaklı yazı korunamazsa daha az ürün denenir. Taşan bir ürün için bütün sayfayı yarım bırakmak yerine gruptaki ürünler yeniden yerleştirilir. Bölümün son sayfasında tek ürün kalmasını azaltmak için otomatik gruplar dengelenir. Teknik bilgi tamamen istendiğinde satırlar korunur, gerekirse devam sayfası oluşturulur. Birden fazla bölüm yoksa içindekiler sayfası üretilmez.

## Doğrulama
- 22 birim testi: seçim güvenliği, eski ayar uyumluluğu, profil ölçüleri, kapak/kart ortak görseli, hazır düzenlerin kapsamı koruması, vitrin ürünü tekrarı, son sayfa dengesi.
- 9 farklı gerçek ürünle A4/A5 × dikey/yatay × 1/2/4/6/9: 20 yerleşim kombinasyonu.
- 80 teknik özellikli ürün: devam sayfaları ve son özelliğin korunması.
- 139 ürünlü kısa katalog: 32 sayfa; kompakt rehber: 18 sayfa. Ürünler eksiksiz ve tekrarsız.
- Crown/Luxury broşürü: 1 sayfa; Crown vitrin seçkisi: 5 sayfa.
- Önizleme/PDF sayfa sayısı eşleşmesi, gerçek PDF'lerin görsel incelemesi.
- TypeScript, ESLint ve production build.

## Yerel inceleme
http://127.0.0.1:3020/admin/collections/catalogs/studio

“Otomatik ·” ile başlayan dört şablon eklenmiştir. Çoğaltarak düzenlenebilir. Örnek PDF'ler output/pdf/catalog-auto-{short,compact,brochure,featured}.pdf konumundadır.

Kaynak görsel çözünürlüğü düşükse yerleşim bunu düzeltemez; mevcut içerik uyarıları korunur. Bu sürüm veritabanı migration'ı gerektirmez. Sunucuya deploy yapılmamıştır.
