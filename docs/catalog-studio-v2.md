# Katalog Stüdyosu — sayfa düzeni ve premium çıktı

19 Kasım 2026

## Kullanıcı kararları

Katalog kısa açıklama ve teknik bilgilerden oluşur. Web sitesinin uzun açıklaması kullanılmaz. Varyasyon kombinasyonları ayrı ürünler gibi listelenmez. Ürün adının önünde kategori zinciri bulunmaz. Katalogdaki isim ve kod değişiklikleri kaynak ürünü değiştirmez.

## Eklenen düzenleme akışı

- **Sayfa planı:** Otomatik kategori düzenini sabitleme, yeni ürün sayfası ve bölüm ayracı ekleme, sayfaları kaldırma ve sıralama.
- **Sayfa bazında tasarım:** Dengeli kartlar, yatay satırlar ve ürün vitrini; her sayfada bağımsız yoğunluk.
- **Sürükle bırak:** Sayfalar, ürün sırası ve sayfalar arası ürün taşıma. Klavye için sıralama düğmeleri ve taşıma menüleri de bulunur.
- **Yerleştirilmeyenler:** Sayfadan çıkarılan ürün kaynak seçiminden silinmez. Bu havuzdan yeniden eklenebilir.
- **Kategori ayırıcıları:** Ana veya alt kategoriye göre gruplama; sayfa başında bölüm bandı veya tam sayfa bölüm kapağı.
- **İçindekiler:** Son yerleşimden sonra gerçek sayfa numaraları hesaplanır. PDF içinde bölüm bağlantıları tıklanabilir.
- **Kapak tasarım alanı:** Başlık ve görsel sürüklenebilir. Boyut, hizalama, zemin/yazı rengi, marka, edisyon, alt başlık ve görselin doldurma biçimi düzenlenebilir. Konum değişiklikleri geri alınabilir.
- **Ana kod:** Ürünün gerçek SKU'su varsa gösterilir. Birden fazla varyantı olan üründe tanımlı kod serisi ya da az sayıdaki gerçek kod kullanılır. Rastgele bir varyant kodu ana SKU olarak atanmaz. Kataloğa özel ana kod girilebilir.

## Yerleşim ilkeleri

Açıklamalar kelime sayısına göre parçalanmaz; paragraf bütünlüğü korunur. Kartların görsel alanları ve bilgi hiyerarşisi düzenlidir. Görsellerdeki boş beyaz kenarlar yalnızca çıktı hazırlanırken kırpılır; kaynak dosyalar korunur.

Kompakt görünümde çap, uzunluk, açı, kapasite ve motor gibi ayırt edici bilgiler önce seçilir. “Tüm teknik bilgiler” seçeneği kaynak tablonun tamamını korur. 6 kartta en fazla 4, 9 kartta en fazla 3 temel özellik gösterilir. Bu sınırlar editörde açıklanır.

Sığmayan ürünün bilgisi ya da görseli sessizce kaldırılmaz. Ürün için vitrin sayfası açılır; çok uzun teknik tablolar gerekirse devam sayfasına aktarılır. Sayfa planındaki yoğunluk hedef kapasitedir. Önizleme kesin sayfa sayısını gösterir.

## Önizleme düzeltmesi

İlk sürüm sayfa düzenini sandbox iframe içinde JavaScript ile hesaplıyor, hazır bilgisini postMessage üzerinden bekliyordu. Yeni sürüm yerleşimi sunucuda tamamlar. Önizleme statik HTML, hesaplanmış sayfa listesi ve sayfa sayısıyla gelir; iframe içinde JavaScript çalıştırılması gerekmez.

Medya hazırlama dört dosyalık gruplarla yürür, dosya zamanı ve kalite profiline göre önbellek kullanır. İsteklerin zaman aşımı vardır; hata durumunda düğmeler yeniden kullanılabilir. Tek sayfa gezinmesi ve yakınlaştırma uzun kataloglarda tüm sayfaları aynı anda görüntüleme ihtiyacını kaldırır.

## Yerel doğrulama

- 19 otomatik test: şema, eski kayıtların uyumluluğu, SKU/kod serisi, kategori planı, ürün ve sayfa taşıma, kaynak içerik güvenliği, aktif seçenek özeti ve teknik alan önceliği.
- TypeScript, yeni kodda ESLint ve production build.
- A4/A5 × dikey/yatay × 1/2/4/6/9 yoğunluk: 20 yerleşim kombinasyonu. A5 yatay için özel sıkı yerleşim doğrulandı.
- 139 aktif ürünle İngilizce katalog: kategori bölümleri, içindekiler ve kodlarla 32 sayfa.
- 6 ürünlü karma örnek: yatay satırlar, bölüm ayracı ve 4 kartlı sayfa; toplam 6 sayfa.
- Ayrıntılı örnek: Crown ve Luxury'nin tüm teknik tabloları; toplam 5 sayfa.
- Statik önizleme ile PDF sayfa sayıları aynı; önizleme HTML'inde çalıştırılabilir script ve ürün şablonları bulunmuyor.
- Tarayıcıda sayfa sürükleme, ürün sıralama, sayfalar arası taşıma, kapak sürükleme, klavye hareketi ve geri alma doğrulandı.
- Gerçek PDF sayfaları görsel olarak incelendi.

## Kullanıcı testi

Yerel ekran: http://127.0.0.1:3020/admin/collections/catalogs/studio

Sayfayı yenileyin. Kayıtlı çalışmalardan **Şablon · Premium · Karma Sayfa Örneği** seçin, çoğaltın ve önizleyin. **Sayfa planı** sekmesinde sayfa yerleşimlerini ve ürün sırasını değiştirin. **Kapak** sekmesinde başlığı veya görseli sürükleyin. Sonra önizleyip PDF oluşturun.

Örnekler:

- `output/pdf/catalog-premium-editorial.pdf`
- `output/pdf/catalog-premium-technical.pdf`
- `output/pdf/catalog-v2-full.pdf`

Çalışma mevcut `codex/catalog-studio` dalındadır. Yerel geri yüklenmiş veritabanı kullanılır. Yeni ayarlar mevcut JSON tasarım alanında saklandığı için bu aşama ek veritabanı migration'ı gerektirmez. İlk sürümün migration'ı sunucuya yayın sırasında hâlâ gereklidir. Bu aşamada uzak sunucuya deploy yapılmamıştır.
