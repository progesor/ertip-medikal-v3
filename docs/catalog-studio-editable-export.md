# Katalog Stüdyosu: düzenlenebilir dışa aktarma

## Kullanım

Üst araç çubuğunda **Dışa aktarma biçimi → Düzenlenebilir · SVG + PDF** seçilir.
**Düzenlenebilir paket oluştur** kaydedilmiş çalışmadan bir çıktı işi başlatır.
Tamamlanan ZIP, **Dosya arşivi** bölümünden indirilir. Standart PDF seçeneği aynı yerde korunur.

Paket:
- `pages/page-NNN.svg`: her sayfa ayrı; canlı metin, ürün/modül grupları, gömülü fotoğraflar ve vektör çizgiler.
- `reference.pdf`: aynı sayfalamanın gönderime hazır PDF görünümü.
- `fonts/`: kullanılan iki ailenin Regular ve SemiBold TTF dosyaları ve OFL lisansları.
- `README.txt`: Türkçe ve İngilizce açma/düzenleme yönergeleri.

ZIP çıkarıldıktan sonra dört font kurulur; SVG, Illustrator veya Inkscape'te Dosya > Aç ile açılır.
Metin aracı, grup içine girme ve Grubu Çöz kullanılabilir. Illustrator'da AI olarak kaydedilebilir.
Bu bir yerel AI/INDD çıktısı değildir. SVG tercihinin gerekçesi, metinleri ve görselleri tek bir
sayfa görüntüsüne dönüştürmeden farklı programlarda düzenlenebilir tutmaktır.

## Uygulama

PDF ve SVG aynı Chromium yerleşim/sayfalama geçişinden üretilir; ayrı bir tasarım motoru yoktur.
SVG dönüştürücü yalnızca katalog şablonunun kullandığı HTML/CSS alt kümesini destekler.
Gelecekte yeni efekt veya blok eklendiğinde SVG karşılığı da doğrulanmalıdır.

- Metin satırları DOM Range koordinatlarından canlı text/tspan nesnelerine çevrilir.
- Başlıklar, ürünler ve kategori bölümleri gruplandırılır.
- Fotoğraflar kalite profiliyle hazırlanır ve veri URI'si olarak gömülür.
- Bağlantı oku, masaüstü font yedeğine ihtiyaç duymayan küçük bir vektör simgesidir.
- SVG 1.1 full kullanılır; kırpma maskeleri korunur.
- SVG'de web fontları da gömülüdür; masaüstü uygulamaları için ayrıca TTF kurmak gerekir.
- Çıktı biçimi mevcut JSON snapshot içinde saklanır. Eski işler PDF üretmeye devam eder.
- ZIP mevcut çıktı koleksiyonunun yetkileriyle korunur; yeni tablo/migration gerekmez.
- fflate asenkron ZIP üretir. Python üretim sunucusunda gerekli değildir.

## Fontların yeniden üretilmesi

Kaynak: projedeki Fontsource Inter ve Source Serif 4 Latin + Latin Extended alt kümeleri.
FontTools ile birleştirilir; aileler Ertip Catalog Sans / Serif olarak yeniden adlandırılır.
Orijinal lisanslar aynen pakete eklenir. Kaynak fontlar güncellenirse:

```sh
python -m pip install fonttools brotli
python scripts/build-catalog-fonts.py
```

Üretilen `public/catalog-fonts` dosyaları repoda tutulur ve dağıtımın public klasörüne dahildir.

## Sınırlar

Metin canlıdır ancak mevcut satır kırılımları sabittir; uzun metin değişiklikleri elle yeniden
yerleşim gerektirebilir. Fotoğraf vektöre dönüştürülmez. Çıktı RGB'dir; CMYK/baskı hazırlığı
grafik programında yapılır. Harici değişiklikler stüdyoya veya ürün kayıtlarına geri aktarılmaz.
Uygulamalar saydamlık/harmanlama ve maskeleri farklı yorumlayabilir; reference.pdf ile
son kontrol yapılmalıdır. Illustrator 2026 kırpma maskeleri için SVG Tiny'ye yeniden kayıt
uyarısı gösterdi; açılan sayfa görünümü ve nesneler korundu. AI veya tam SVG 1.1 tercih
edilmelidir. Bağlantı simgesinin font uyarısı vektör simgeye geçilerek giderildi.
Inkscape'te ayrı bir uygulama testi yapılmadı.

## Doğrulama

- 34 katalog birim testi: canlı metnin/paket fontlarının/lisansların korunması ve güvenli dosya adları dahil.
- Gerçek yerel ürünlerle 139 ürün / 23 sayfalık paket; A5 altılı ve iki ürünlü satır düzeni.
- Dört sayfalık örnekte kapak, içindekiler, karışık kategorili ürün sayfası, arka kapak.
- Illustrator 2026: SVG açıldı; sayfa görünümü ve metnin yazı aracıyla seçilmesi doğrulandı.
- Üretim derlemesi, TypeScript ve hedefli ESLint geçti.
- Gerçek API'den ZIP ve eski biçimsiz istekle PDF üretimi/indirilmesi geçti; oturumsuz indirme 403.
- Panelde biçim seçimi, paket oluşturma ve ZIP indirme doğrulandı.

## Başvuru

- [Adobe Illustrator desteklenen biçimler](https://helpx.adobe.com/illustrator/desktop/get-started/learn-the-basics/supported-file-formats.html)
- [fflate belgeleri](https://github.com/101arrowz/fflate)

## Arşivden silme

Dosya arşivinde PDF/ZIP indirme işleminin yanında yöneticiler için **Sil** bulunur.
İkinci onayla çıktı dosyası ve arşiv kaydı kalıcı olarak kaldırılır; çalışma
tasarımı ve kaynak ürün görselleri korunur. Çalışan veya sıradaki çıktılar
silinemez. Aynı koruma Katalog dosya arşivi koleksiyonuna da uygulanır.
