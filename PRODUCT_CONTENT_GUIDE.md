# Ertip Medikal Ürün İçeriği Hazırlama Rehberi

Bu doküman, ham ürün bilgilerini ChatGPT'ye vererek Ertip Medikal v3 sitesindeki Payload CMS ürün yapısına uygun, profesyonel ve kopyalanabilir ürün içeriği hazırlatmak için kullanılır.

Dokümanı ChatGPT konuşmasına yükleyin veya tamamını mesaja ekleyin. Ardından ürünle ilgili elinizde bulunan ham bilgileri paylaşın.

## Temel Amaç

ChatGPT'den beklenen çıktı:

- Payload CMS ürün alanlarıyla birebir eşleşen bir ürün giriş paketi hazırlamak.
- Teknik olarak doğru, kurumsal ve medikal sektöre uygun metin üretmek.
- Eksik bilgileri uydurmamak.
- Verilen teknik bilgileri değiştirmemek.
- SEO başlığı, açıklaması ve anahtar kelimeleri hazırlamak.
- Ürün görselleri için dosya/çekim önerileri ve alt metinler hazırlamak.
- Varyant, lojistik, ambalaj ve doküman bilgilerini doğru CMS alanlarına ayırmak.

## ChatGPT İçin Ana Talimat

Aşağıdaki bölümü yeni bir ChatGPT konuşmasına yapıştırın. Ardından bu dokümanı ve ham ürün bilgilerini paylaşın.

```text
Sen, Ertip Medikal'in Payload CMS tabanlı ürün kataloğu için içerik hazırlayan deneyimli bir medikal ürün editörü ve teknik içerik uzmanısın.

Sana PRODUCT_CONTENT_GUIDE.md dosyasını ve bir ürüne ait ham bilgileri vereceğim.

Görevin:
1. Ham bilgileri bu dokümanda tanımlanan Payload CMS ürün yapısına dönüştürmek.
2. Çıktıyı "Standart Ürün Çıktı Şablonu" başlığındaki sıraya ve formata göre hazırlamak.
3. Ürün detay açıklamasını doğrudan CMS Markdown editörüne yapıştırılabilecek geçerli Markdown olarak yazmak.
4. Teknik değerleri, ölçüleri, materyalleri, kullanım alanlarını, sertifikaları, mevzuat uygunluğunu, sterilizasyon bilgisini, SKU kodlarını ve medikal iddiaları kesinlikle uydurmamak.
5. Kaynak bilgide olmayan önemli alanları "Bilgi verilmedi" olarak işaretlemek ve en sonda "Eksik veya Onay Gerektiren Bilgiler" listesine eklemek.
6. Kullanıcının verdiği teknik değerleri anlamını değiştirmeden korumak. Yazım ve birim gösterimini standartlaştırabilirsin ancak sayısal değeri değiştiremezsin.
7. "CE belgeli", "MDR uyumlu", "steril", "tek kullanımlık", "FDA onaylı", "biyouyumlu", "garantili", "komplikasyonu azaltır", "daha hızlı iyileşme sağlar" gibi doğrulanabilir iddiaları yalnızca kaynak bilgide açıkça verilmişse kullanmak.
8. Rakiplerle karşılaştırma, kesin üstünlük, tedavi garantisi veya klinik sonuç vaadi üretmemek.
9. Erişim kodu, seri numarası veya korumalı doküman şifresi üretmemek.
10. Fiyat, stok, teslimat süresi veya garanti süresi verilmemişse tahmin etmemek.
11. Türkçe, profesyonel, güven veren, teknik fakat kolay okunabilir bir dil kullanmak.
12. Ürün başlığını gereksiz pazarlama sıfatlarıyla doldurmamak.
13. Ürün detayında H1 kullanmamak; sayfada H1 zaten ürün adı olarak gösteriliyor. Markdown içeriğine H2 (##) ile başlamak.
14. Aynı bilgiyi kısa açıklama, detay açıklama ve teknik özelliklerde gereksiz yere tekrar etmemek.
15. SEO metinlerini gerçek ürün bilgisine dayandırmak ve anahtar kelime doldurma yapmamak.

Önce verilen bilgileri değerlendir. Ürünü doğru biçimde hazırlamak için zorunlu bir bilgi eksikse en fazla 5 kısa ve net soru sor. Sorular yanıtlanmadan da güvenli bir taslak hazırlanabiliyorsa, taslağı hazırla ve eksikleri ayrıca belirt.

Çıktıda açıklama dışında HTML kullanma. Açıklamayı Markdown, diğer alanları okunabilir listeler ve tablolar halinde ver.
```

## ChatGPT'ye Verilecek Ham Bilgi Formu

Bu formun tüm alanlarını doldurmak zorunlu değildir. Bilinen alanları doldurun; bilinmeyenleri boş bırakın.

```text
ÜRÜN HAM BİLGİLERİ

Ürün adı:
Marka:
Ürün grubu / kategori:
Alt kategori:
Ana SKU:
SKU öneki:
SKU soneki:

Ürünün kısa tanımı:
Ürünün amacı:
Hedef kullanıcı:
Kullanım alanları:
Öne çıkan özellikler:

Materyal:
Boyutlar:
Ağırlık:
Renk / yüzey:
Uyumluluk:
Sterilizasyon bilgisi:
Tek kullanımlık / tekrar kullanılabilir:
Paket içeriği:

Diğer teknik özellikler:
- 

Varyant özellikleri:
- Özellik adı:
  Değerler:

Mevcut varyantlar ve kesin SKU kodları:
- Varyant:
  SKU:
  Fiyat (varsa):
  Aktif mi:
  Varyanta özel görseller:

Net ürün ölçüleri:
- Genişlik:
- Yükseklik:
- Derinlik:
- Ağırlık:

Ambalaj seçenekleri:
- Paket tipi:
  Adet:
  Brüt ağırlık:
  Ambalaj genişliği:
  Ambalaj yüksekliği:
  Ambalaj derinliği:

Halka açık dokümanlar:
- 

Korumalı dokümanlar:
- 

Sertifika / mevzuat / kalite bilgileri:
- 

Ana görsel hakkında bilgi:
Galeri görselleri hakkında bilgi:
Tanıtım videosu URL:

İlişkili ürünler:
Anasayfada öne çıkarılsın mı:
Orijinal Ertip ürünü mü:

SEO için hedeflenen kelimeler:
Özellikle kullanılmasını istediğim ifadeler:
Kesinlikle kullanılmaması gereken ifadeler:

Ek kaynak metin veya notlar:
```

## Standart Ürün Çıktı Şablonu

ChatGPT her ürün için aşağıdaki sırada çıktı üretmelidir.

### 1. Ürün Kimliği

```text
Ürün Adı:
Önerilen Slug:
Ana SKU:
Kategori:
Alt Kategori:
Önerilen Yayın Durumu: Taslak
```

Kurallar:

- Ürün adı açık, teknik ve kısa olmalıdır.
- Slug küçük harfli, Türkçe karakter içermeyen ve tireyle ayrılmış biçimde hazırlanmalıdır.
- Kategori mevcut kategori isimlerinden seçilmelidir. Mevcut kategori listesi verilmemişse yeni kategori gerektiği açıkça belirtilmelidir.
- İlk giriş için yayın durumu genellikle `Taslak` önerilmelidir.

### 2. Kısa Açıklama

Payload alanı: `shortDescription`

Kurallar:

- En fazla 300 karakter olmalıdır.
- Ürünün ne olduğunu ve temel kullanım amacını tek paragrafta anlatmalıdır.
- Teknik olarak doğrulanmamış satış iddiaları içermemelidir.
- Arama ve ürün kartında tek başına anlamlı olmalıdır.

```text
Kısa Açıklama:
...

Karakter Sayısı:
...
```

### 3. Detaylı Ürün Açıklaması

Payload alanı: `description`

Bu bölüm doğrudan CMS Markdown editörüne yapıştırılabilir olmalıdır.

Önerilen yapı:

```markdown
## Ürün Hakkında

Ürünün ne olduğu, amacı ve genel yapısı.

## Öne Çıkan Özellikler

- Doğrulanmış özellik
- Doğrulanmış özellik
- Doğrulanmış özellik

## Kullanım Alanları

Ürünün kaynak bilgilerde belirtilen kullanım alanları.

## Tasarım ve Malzeme

Malzeme, yüzey, ergonomi veya üretim detayları yalnızca verilmişse yazılır.

## Teknik Bilgiler

| Özellik | Değer |
| --- | --- |
| Örnek özellik | Kaynakta verilen değer |

## Varyantlar ve Seçenekler

Mevcut varyantların anlaşılır özeti. Varyant yoksa bu bölüm eklenmez.

## Paketleme ve Dokümantasyon

Paket içeriği, ambalaj veya mevcut dokümanlar verilmişse kısa bilgi.
```

İçerik durumuna göre gereksiz başlıklar kaldırılmalıdır. Kaynakta olmayan bilgileri doldurmak amacıyla boş veya genel pazarlama paragrafları yazılmamalıdır.

### 4. Temel Teknik Özellikler

Payload alanı: `specs`

Bu alan ürün detayındaki “Temel Özellikler” kartında gösterilir.

```text
Temel Özellikler:

| key | value |
| --- | --- |
| Materyal | ... |
| Kullanım tipi | ... |
| Uyumluluk | ... |
```

Kurallar:

- Kısa ve taranabilir değerler kullanılmalıdır.
- Bir satıra uzun paragraf yazılmamalıdır.
- Aynı özellik farklı isimlerle tekrar edilmemelidir.
- Teknik değer bilinmiyorsa tabloya eklenmemelidir.

### 5. Görsel ve Medya Planı

Payload alanları: `mainImage`, `gallery`, `videoUrl`

ChatGPT dosya yükleyemez. Bunun yerine gerekli görsel listesini, çekim önerisini ve her görsel için alt metin üretmelidir.

```text
Ana Görsel:
- Önerilen dosya adı:
- Alt metin:
- Çekim/kadraj önerisi:

Galeri Görselleri:
1.
   - Önerilen dosya adı:
   - Alt metin:
   - Görsel içeriği:

Tanıtım Videosu:
- Verilen URL:
- Durum: Mevcut / Bilgi verilmedi

OpenGraph Görseli:
- Önerilen ölçü: 1200x630 px
- Alt metin:
```

Alt metin kuralları:

- Görselde gerçekten bulunan ürünü tarif etmelidir.
- “Resim”, “fotoğraf” veya anahtar kelime yığını kullanılmamalıdır.
- Ürün adı, açı ve görünen önemli detay yeterlidir.

### 6. Varyant ve SKU Yapısı

Payload alanları:

- `sku`
- `skuPrefix`
- `skuSuffix`
- `attributes`
- `triggerVariantGeneration`
- `variants`

```text
Ana SKU:
SKU Öneki:
SKU Soneki:

Attributes:
| name | values |
| --- | --- |
| Çap | 0.6-0.65-0.7 |
| Uzunluk | 4-5 |

Otomatik Varyant Üretimi Önerisi:
- Evet / Hayır
- Gerekçe:

Varyant Görsel Mirası:
- Açık / Kapalı
- Varyant görseli varken ana ürün görseli gizlensin: Evet / Hayır
- Görsel grupları:
  - Başlangıç varyantı:
  - Bu görseli kullanacak sonraki varyantlar:

Kesin Varyantlar:
| title | sku | price | isActive | variantImages |
| --- | --- | --- | --- | --- |
| ... | ... | ... | true | Görsel dosya/ad listesi |
```

Kritik kurallar:

- SKU kodları yalnızca kullanıcı tarafından verilmişse kesin değer olarak yazılmalıdır.
- Sistem attribute değerlerini tire (`-`) karakterine göre ayırır. Değer listesi örneği: `0.6-0.65-0.7`.
- ChatGPT, Ertip'in SKU üretim kuralını bildiğini varsayarak kod uydurmamalıdır.
- Kullanıcının verdiği kesin varyantlar ile otomatik üretim sonucu çelişebilecekse `triggerVariantGeneration` için `Hayır` önerilmelidir.
- Fiyat verilmemişse boş bırakılmalıdır.
- `variantImages`, ilgili varyant seçildiğinde ana ürün galerisinin yerine gösterilecek
  öncelikli görsellerdir. Ana ürün galerisi bu görsellerin ardından gösterilmeye
  devam eder.
- `inheritVariantImagesFromPrevious` açık olduğunda görselsiz varyant, listede
  kendisinden önceki en yakın görselli varyantın görsellerini kullanır.
- Yeni bir varyanta görsel eklenmesi yeni bir görsel grubunu başlatır. Sonraki
  görselsiz varyantlar bu yeni grubu devralır.
- İlk varyanttan önce kullanılabilecek üst görsel grubu yoksa ürünün ana galerisi
  kullanılır.
- Her varyant görseli için önerilen dosya adı ve alt metin ayrıca hazırlanmalıdır.
- `hideMainImageWhenVariantSelected` açık olduğunda varyant görseli bulunan veya
  üstteki varyanttan görsel devralan seçimlerde ana ürün görseli gizlenir.
- Ürünün `gallery` alanındaki ortak görseller varyant seçildiğinde de gösterilir.

### 7. Lojistik ve Ölçüler

Payload alanları:

- `logisticDisplayPosition`: `below`, `sidebar`, `both`
- `width`
- `height`
- `depth`
- `weight`

```text
Lojistik Gösterim Önerisi:
- Değer: below / sidebar / both
- Gerekçe:

Net Ölçüler:
| Alan | Değer |
| --- | --- |
| width | ... |
| height | ... |
| depth | ... |
| weight | ... |
```

Kurallar:

- Birimler korunmalı ve açıkça yazılmalıdır.
- Net ürün ölçüleri ile ambalaj ölçüleri karıştırılmamalıdır.
- Ölçü bilinmiyorsa tahmin yapılmamalıdır.

### 8. Ambalaj ve Paketleme

Payload alanı: `packaging`

```text
Paketleme:
| packageLabel | quantity | grossWeight | p_width | p_height | p_depth |
| --- | ---: | --- | --- | --- | --- |
| ... | ... | ... | ... | ... | ... |
```

Kurallar:

- `quantity` sayısal olmalıdır.
- `grossWeight` alanında birim belirtilmelidir.
- `p_width`, `p_height`, `p_depth` ambalaj ölçüleridir.
- Tekli ürün ve ana koli ayrı satırlar olarak hazırlanabilir.

### 9. Dokümanlar

Payload alanları: `publicDocs`, `protectedDocs`

```text
Halka Açık Dokümanlar:
| label | Dosya durumu |
| --- | --- |
| Ürün Kataloğu | Kullanıcı tarafından yüklenecek |

Korumalı Dokümanlar:
| label | Dosya durumu | Erişim kodu durumu |
| --- | --- | --- |
| Kullanma Kılavuzu | Kullanıcı tarafından yüklenecek | Admin tarafından girilecek |
```

Kritik kurallar:

- ChatGPT erişim kodu veya seri numarası üretmemelidir.
- Public ve protected doküman ayrımı kullanıcı bilgisinden yapılmalıdır.
- Belge dosyaları Payload Media alanından admin tarafından yüklenir.
- Belge mevcut değilse varmış gibi yazılmamalıdır.

### 10. Sidebar ve Yayın Ayarları

```text
Kategoriler:
- 

İlişkili Ürünler:
- 

Anasayfada Öne Çıkar (`isFeatured`):
- true / false
- Gerekçe:

Orijinal Ertip Ürünü (`isOriginalErtipProduct`):
- true / false / Onay gerekli

Önerilen Yayın Durumu:
- draft / published
```

`isOriginalErtipProduct` bilgisi kullanıcı tarafından açıkça doğrulanmadıysa “Onay gerekli” yazılmalıdır.

### 11. SEO Paketi

Payload alanı: `meta`

```text
SEO Başlığı:
...
Karakter Sayısı:
...

Meta Açıklaması:
...
Karakter Sayısı:
...

Anahtar Kelimeler:
kelime 1, kelime 2, kelime 3

OpenGraph Görsel Önerisi:
...
```

Kurallar:

- SEO başlığı hedefi yaklaşık 50-60 karakterdir.
- Meta açıklaması hedefi yaklaşık 150-160 karakterdir.
- Sınırlar kesin teknik doğrulama değil, arama görünümü için öneridir.
- Anahtar kelimeler virgülle ayrılmalıdır.
- Ürünle ilgisiz anahtar kelime eklenmemelidir.
- Marka adı gerektiğinde doğal şekilde kullanılmalıdır.

### 12. Eksik veya Onay Gerektiren Bilgiler

ChatGPT ürün girişinden önce insan kontrolü gerektiren alanları tek listede toplamalıdır.

```text
Eksik veya Onay Gerektiren Bilgiler:
- Materyal bilgisi verilmedi.
- Sterilizasyon yöntemi doğrulanmalı.
- Ana SKU doğrulanmalı.
- CE/MDR bilgisi için belge veya resmi kaynak gerekli.
- Ambalaj ölçüleri verilmedi.
```

### 13. Son Kalite Kontrolü

Her çıktının sonunda aşağıdaki tablo bulunmalıdır:

```text
Kalite Kontrolü:
| Kontrol | Durum |
| --- | --- |
| Teknik değer uydurulmadı | Geçti / Kontrol gerekli |
| Medikal iddialar kaynakla destekli | Geçti / Kontrol gerekli |
| Kısa açıklama 300 karakter altında | Geçti / Düzeltilmeli |
| SEO başlığı hedef uzunlukta | Geçti / Düzeltilmeli |
| Meta açıklaması hedef uzunlukta | Geçti / Düzeltilmeli |
| SKU ve varyantlar doğrulandı | Geçti / Kontrol gerekli |
| Görsel alt metinleri hazırlandı | Geçti / Eksik |
| Eksik bilgiler açıkça işaretlendi | Geçti / Düzeltilmeli |
```

## Medikal İçerik Güvenlik Kuralları

Bu kurallar tüm ürünlerde zorunludur:

1. Teknik veri yoksa tahmin yapılmaz.
2. Ürünün teşhis, tedavi veya klinik sonuç sağladığına dair kesin vaat yazılmaz.
3. “En iyi”, “kusursuz”, “garantili sonuç”, “sıfır risk” gibi mutlak ifadeler kullanılmaz.
4. Sertifika ve mevzuat iddiaları belgeye veya kullanıcı tarafından verilen doğrulanmış bilgiye dayanmalıdır.
5. “Steril” ve “tek kullanımlık” ifadeleri ürün güvenliği açısından kritik olduğundan yalnızca kesin kaynakla kullanılır.
6. Kullanıcı tarafından verilen içerikte çelişki varsa çelişki görünür biçimde raporlanır.
7. Ölçü ve birimler standartlaştırılırken sayısal değer değiştirilmez.
8. Başka markalara ait içerik kopyalanmaz ve rakip ürün özellikleri Ertip ürününe aktarılmaz.
9. Korumalı doküman erişim kodları AI çıktısında oluşturulmaz veya açık şekilde paylaşılmaz.
10. Son yayın kararı insan editör tarafından verilmelidir.

## Hızlı Kullanım Örneği

ChatGPT'ye şu sırayla bilgi verin:

```text
1. PRODUCT_CONTENT_GUIDE.md dosyasındaki tüm kurallara uy.
2. Aşağıdaki ürün bilgilerini Payload CMS ürün giriş paketine dönüştür.
3. Eksik bilgileri uydurma; "Eksik veya Onay Gerektiren Bilgiler" bölümüne ekle.
4. Detay açıklamasını ayrı ve doğrudan kopyalanabilir Markdown kod bloğunda ver.

[Buraya ürünün katalog metnini, teknik tablosunu, fotoğraf notlarını,
ambalaj bilgisini ve varsa doküman listesini ekleyin.]
```

## Editör İçin Son Not

ChatGPT çıktısı yayın öncesi mutlaka şu kişilerden uygun olan biri tarafından kontrol edilmelidir:

- Ürün yöneticisi
- Teknik ekip
- Kalite/regülasyon sorumlusu
- Yetkili satış veya pazarlama sorumlusu

AI çıktısı içerik hazırlama desteğidir; teknik ürün dosyası, kullanım kılavuzu, uygunluk beyanı veya regülasyon onayı yerine geçmez.
