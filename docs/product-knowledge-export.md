# Ürün bilgi bankası dışa aktarımı

## Kapsam

Yönetim → Ürün bilgi bankası, /admin/collections/products/disa-aktar.
Sadece yönetici erişimi; başlatma, listeleme ve indirmede sunucuda tekrar doğrulanır.
Site ürünlerine veya medyaya yazılmaz.

Kapsam: tüm ürünler, kategori (alt kategoriler isteğe bağlı), seçilen ürünler.
Durum: yayımlanmış sürüm / son kaydedilmiş tüm kayıtlar / son kaydedilmiş taslaklar.
TR ve EN kaynakları birlikte, fallback kapalı. Pasif varyantlar dahil tüm varyantlar korunur.
Sürüm geçmişi ve protectedDocs.accessCodes hariç tüm ürün alanları JSON'da korunur.

Dosya seçenekleri:
- Görselsiz: medya metadata, URL ve alan eşleştirmeleri korunur.
- Görseller: ana, galeri, varyant, rich-text upload ve kategori görselleri.
- Belgeler: publicDocs ve protectedDocs'a bağlı dosyalar; erişim kodları dahil değildir.
- Harici video/link adresleri veri olarak kalır; ağdan dosya indirilmez.
- Orijinaller kullanılır; optimizasyon türevleri tekrar kopyalanmaz.

## Paket sözleşmesi v1

- manifest.json: schemaVersion, kapsam, tarih, sayılar, eksik dosya uyarıları, hariç alanlar.
- data/products.json: JSON kaynak kayıtları; tüm ürün alanları.
- data/products.ndjson: her satır tek ürün; _export içinde kategori ve medya bilgileri.
- data/categories.json: seçilen ürünlerin kategorileri ve tüm üst kategorileri.
- data/media.json: medya metadata, archivePath, dahil/hariç/eksik durumu, SHA-256, boyut.
- data/media-references.json: koleksiyon / kayıt ID / alan yolu / medya ID.
- data/fields.json: ürün alanları, tipleri, dil bilgisi ve ilişkiler.
- tables/: products, variants, specifications, categories, media, media-references CSV.
- ai/tr ve ai/en: ID bazlı Markdown; okunabilir uzun/kısa açıklama, teknik özellikler ve tam kaynak.
- assets/media-ID/original-name: ID ile tekilleştirilmiş dosya.
- README.md: Türkçe ve İngilizce kullanım açıklaması.

CSV UTF-8 BOM + RFC 4180 tırnaklama kullanır. Diziler hücrede JSON olarak saklanır.
Varyant ve teknik özellik dizileri ayrı tablolarda da bulunur. Formül başlangıçları tek tırnakla
korunur; JSON kaynak değerlerini değiştirmez. Eksik çeviri doldurulmaz.

## Çalışma ve depolama

Mevcut BACKUP_DIR altındaki product-exports özel dizini; public/media içine yazılmaz.
Next after ile yanıt sonrası çalışır; aynı sunucuda tek aktif iş için dosya kilidi vardır.
Dosya akışı ZIP'e küçük parçalar halinde yazılır, yazma geri basıncı beklenir.
Paket 3 GB ile sınırlandırılır (ZIP32 sınırının altında); büyük seçimler kategoriye bölünür.
Tamamlanmış dosya atomik ad değişimiyle yayınlanır; indirme response stream kullanır.
Sunucu yeniden başlayınca kesilen işler başarısız gösterilir; kullanıcı tekrar başlatabilir.
7 gün sonra listeleme/yeni iş sırasında süresi dolmuş paketler temizlenir.
Tek uygulama sunucusu ve mevcut kalıcı yedek diski hedeflenir; dağıtık iş kuyruğu değildir.
Yeni tablo, kolon veya migration yoktur.

## Güvenlik ve doğruluk

Yönetici + x-ertip-export özel istek başlığı + aynı origin kontrolü.
İndirme yalnızca kimliği doğrulanmış yöneticiye, no-store ve attachment olarak verilir.
Dosya adları basename ve realpath ile medya dizinine sınırlandırılır; URL fetch yapılmaz.
ZIP giriş adları sunucu tarafından oluşturulur; veri başlıkları dosya yolu olarak kullanılmaz.
Kimlik, erişim kodu veya başka koleksiyonların kullanıcı/teklif verisi pakete eklenmez.
Kaynak kayıtlar partiler halinde okunur; tek veritabanı anına ait atomik snapshot değildir.
Eksik dosya sessizce başarılı sayılmaz; manifest ve panel uyarısı bulunur.
Okuma sırasında I/O hatası olursa kısmi paket indirmeye açılmaz.
Bu bir CMS geri yükleme biçimi değildir; mevcut yedekleme ayrı kalır.

## Doğrulama planı

- İki dil, tüm alanlar, pasif varyant, kategori hiyerarşisi, medya tekilleştirme.
- CSV tırnak/newline/formül kaçışı ve JSON'da orijinal değer.
- Dosya eşleştirmesi, SHA-256, görselsiz/dosyalı paket.
- Kayıp dosya, dizin dışına çıkma, oturumsuz ve editör erişimi.
- Gerçek yerel ürünlerle tam paket ve panelden oluştur/indir akışı.
- TypeScript, hedefli lint, üretim build.

## Tamamlanan doğrulama — 20 Kasım 2026

- 8 otomatik test: kapsam, döngülü kategori ağacı, dil/alan koruma, erişim kodu çıkarma,
  CSV güvenliği, medya keşfi, sayfalı okuma, gerçek ZIP/dosya/hash/eksik dosya,
  özel depolama/kilit/süre sonu ve proxy arkasında origin kontrolü.
- Gerçek yerel veriler: 162 ürün, 32 kategori, 580 medya, 837 alan referansı;
  184.054.043 bayt örnek paket; eksik dosya yok.
- API: 139 yayımlanmış ürün görselsiz; tek Crown ürünü 5 medya ile;
  kategoriden 17 ürün. ZIP içindeki kayıtlar ve medya seçenekleri doğrulandı.
- Oturumsuz ve editör hesabıyla listeleme, başlatma, indirme reddedildi;
  özel başlık, origin ve boş seçim kontrolleri geçti.
- Yönetim ekranından 162 ürün / 580 dosyalı iş oluşturuldu ve ZIP indirildi.
- TypeScript, hedefli ESLint ve production build geçti.

CSV aktarımında SKU sütunları metin türüyle alınmalıdır; otomatik sayı dönüşümü
baştaki sıfırları silebilir. JSON her zaman asıl değeri korur.

## Arşiv temizliği (20 Kasım 2026)

Ürün aktarımı, Katalog Stüdyosu ve Yedekleme ekranlarında indirme bağlantısının
yanındaki **Sil**, dosya adını/tarihini gösteren **Kalıcı olarak sil** onayını açar.
Yalnızca yöneticiler kullanabilir. Arşiv dosyası ve kayıt kaldırılır; ürünler,
kaynak medya ve katalog çalışma ayarları korunur. Bu işlem geri alınamaz.

- Ürün paketleri: ZIP ve varsa yarım kalan dosya temizlenir; kayıt en son silinir.
  Çalışan aktarım korunur. Tamamlanamayan işler de silinebilir.
- Katalog: PDF veya düzenlenebilir ZIP, Payload upload temizliği ile kaldırılır.
  Sıradaki/çalışan işler koleksiyon erişimi ve beforeDelete kancası ile korunur.
  Eski çıktılara Katalog dosya arşivi listesinden de erişilebilir.
- Yedekler: .ertip ve durum kaydı kaldırılır. Geri yükleme/oluşturma ile ortak
  PostgreSQL kilidi kullanılır; çalışan/bekleyen yedekleme ve yarım kalmış geri
  yükleme varsa silme reddedilir. Başarısız işlem geçmişi de temizlenebilir.
- DELETE uçları mevcut yönetici oturumu, ilgili özel istek başlığı, aynı kaynak
  kontrolü ve confirm=true ister. Silme için yeni MCP izni açılmaz.

Doğrulama: 9 ürün aktarımı testi, 34 katalog testi; gerçek yerel API ile PDF,
ZIP ve .ertip dosyalarının/kayıtlarının kaldırılması; editör/oturumsuz erişim,
eksik onay/başlık, yabancı origin, çalışan katalog işi, yedek kilidi ve tekrar
silme denemeleri. Kaynak ürün/medya/katalog sayıları değişmedi. Üç yönetim
ekranında silme onayı ve vazgeçme kontrolleri incelendi.
