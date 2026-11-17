# Siteyi yedekleme ve taşıma

Yönetici hesabıyla panel ana sayfasından **Yedekleme ve taşıma** ekranına girin. Bir yedek türü seçin. Paket hazır olduğunda **İndir** ile sunucu dışında bir kopyasını saklayın.

| Tür | İçerik |
| --- | --- |
| Tam yedek | PostgreSQL kayıtları, kullanıcılar, ayarlar, başvurular, ürünler ve tüm medya dosyaları |
| Veritabanı (SQL) | PostgreSQL şeması ve verileri, Payload göç geçmişi, medya kayıtları ve ilişkileri |
| Medya dosyaları | Medya klasörünün tamamı, orijinaller, korumalı belgeler, küçük resimler ve optimize edilmiş dosyalar |

Paketler kaynak kurulumun `PAYLOAD_SECRET` değeriyle şifrelenir. Bu değeri parola yöneticisinde ayrıca saklayın. Uygulama kodu Git'ten, ortam değişkenleri ve alan adı ayarları Coolify'dan gelir. Paketler veritabanı rolleri ve sunucu genelindeki PostgreSQL ayarlarını içermez.

## Coolify kurulumu

- Uygulama konteynerinde **/app/media** ve **/app/.backups** için ayrı, yazılabilir kalıcı diskler bağlayın. Depolama yolunu değiştirmek için `BACKUP_DIR` kullanabilirsiniz. Yedek ve çalışma dizinini yalnız uygulama kullanıcısına açın.
- Railpack, son imaja dağıtımın `postgresql-client` paketini ekler. Konteynerde `pg_dump --version` ve `psql --version` ile sürümleri kontrol edin. Kaynak ve hedefte veritabanınızın ana sürümüne uygun istemci kullanın. Özel bir kurulumda `PG_BIN_DIR` her iki aracın bulunduğu dizindir.
- `DATABASE_URI` siteye ayrılmış veritabanına doğrudan bağlanmalı, uygulama kullanıcısı tabloların sahibi olmalıdır. Panelden geri yükleme tek uygulama örneği için tasarlanmıştır. Birden fazla örnek varsa trafiği durdurup CLI ile yükleyin ve tüm örnekleri yeniden başlatın.
- Medya ve tam yedeği, dosya yükleme veya görsel optimizasyonu tamamlandıktan sonra alın. Taşıma sırasında kaynak siteye yapılan düzenlemeleri ve yeni başvuruları yedek anından alan adı geçişine kadar durdurun.
- Yedek diski, paketle birlikte geçici SQL, açılan medya ve geri yükleme öncesi medya kopyasını alacak boş alana ihtiyaç duyar. Panel yükleme sınırı varsayılan 16 GiB'dir (`BACKUP_UPLOAD_MAX_BYTES`). Ters vekil veya CDN daha düşük bir sınır uyguluyorsa paketi sunucuya aktararak CLI komutunu kullanın.

## Kayıtlı bir yedeğe dönme

Paketi **Kayıtlı yedekler** listesinden seçin. Dosya bilgisayarınızdaysa **Paket yükle** ile listeye ekleyin. Bu adım paketin bütünlüğünü ve anahtarını kontrol eder. **Geri yükle** ve ardından kapsamı gösteren onay düğmesiyle işlemi başlatın. Medya yedeği dizinin içeriğini değiştirir. SQL yedeği paketteki veritabanı nesnelerini ve verilerini geri getirir. Eski bir sürümden farklı bir şemaya geçerken boş hedef veritabanını kullanın.

Geri yükleme sırasında site istekleri geçici olarak 503 yanıtı alır. PostgreSQL işlemi tek transaction içinde çalışır. Tam geri yükleme başarısız olursa önceki medya geri alınır. Sunucu işlem sırasında kapanırsa aynı paketi yeniden seçin. CLI kullandıysanız uygulamayı yeniden başlatın. Kullanıcı ve oturum kayıtları yedekteki tarihe döner.

## Yeni sunucuya geçme

1. Kaynakta tam yedek alın ve paketi indirin. Kaynak Git sürümünü ve `PAYLOAD_SECRET` değerini saklayın.
2. Hedefe aynı Git sürümünü kurun, yeni boş PostgreSQL veritabanını ve iki kalıcı diski hazırlayın. Hedef `DATABASE_URI`, alan adı ve SMTP ayarlarıyla birlikte kaynak `PAYLOAD_SECRET` değerini tanımlayın.
3. Uygulamanın çalışma dizininde, hedefe trafik açmadan önce paketi geri yükleyin. CLI, panel hesabı gerektirmez.

   ```sh
   pnpm backup restore /transfer/site.ertip --confirm
   ```

4. Uygulamayı normal başlangıç komutuyla açın (`pnpm start` bekleyen Payload göçlerini çalıştırır). Eski yönetici hesabıyla giriş yapın. Bir ürünü, görselini ve korumalı bir belgeyi kontrol ettikten sonra alan adını hedefe yönlendirin.

## Komut satırı

### MCP üzerinden yedek alma

Yöneticiye bağlı MCP bağlantısında **Özel araçlar** altında kullanacağınız izinleri açın. `createSiteBackup` seçilen türde yedeği başlatır ve işlem kimliğini verir. `listSiteBackups` aynı kimlikle durumunu gösterir. Durum `done` olduğunda `getSiteBackupDownload` dosyanın boyutunu ve aynı sunucudaki indirme yolunu verir. Paketi bu yoldan, isteğin `Authorization: Bearer` başlığında aynı MCP anahtarıyla indirin. Anahtarın indirme yetkisi ve bağlı kullanıcının yönetici rolü her istekte kontrol edilir.

### Sunucu komutları

```sh
pnpm backup create full
pnpm backup create sql
pnpm backup create media
pnpm backup extract /transfer/site.ertip
```

`create` indirilebilir paketin yolunu yazar. `extract` aynı anahtarla paketi özel bir çalışma dizinine açıp yolunu gösterir. SQL içeren paketlerin içindeki `database.sql` standart PostgreSQL SQL dosyasıdır. Çıkarılan dosyalar açık metindir.
