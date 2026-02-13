# **🏥 Proje: Ertip Medikal \- "Master Plan" (v3.0)**

**Proje Sahibi:** Anıl Akman (Ertip Medikal) 

**Revizyon Tarihi:** 10 Şubat 2026 (v3.0 \- Full Technical Specification) 

**Hedef:** Next.js ve PayloadCMS kullanılarak DigitalOcean VPS üzerinde çalışan; yüksek performanslı, SEO odaklı, blok tabanlı kurumsal web platformu.

## **1\. 🛠️ Detaylı Teknoloji Envanteri (The Arsenal)**

Bu projede kullanılacak kütüphaneler ve araçların tam listesi:

### **Core & Backend**

* **Framework:** `Next.js 15 (App Router)` \- React Server Components (RSC) mimarisi.  
* **CMS:** `PayloadCMS 3.0` \- Headless, Code-first CMS.  
* **Database:** `PostgreSQL 16` \- Veri tutarlılığı için.  
* **ORM:** `Drizzle ORM` (Payload Native Adapter) \- Yüksek performanslı SQL sorguları için.  
* **Runtime:** `Node.js 20.x (LTS)` ve paket yöneticisi olarak `pnpm` (Disk alanı tasarrufu için önerilir).

  ### **Frontend & UI**

* **Styling:** `Tailwind CSS v4` \- Utility-first CSS.  
* **Component Library:** `Shadcn/UI` (Radix UI tabanlı) \- Erişilebilir, özelleştirilebilir bileşenler.  
* **Icons:** `Lucide React` \- Modern ikon seti.  
* **Fonts:** `Geist Sans` & `Geist Mono` (Next.js default) veya kurumsal kimliğe uygun Google Font.  
* **Animations:** `Framer Motion` (Gerektiğinde yumuşak geçişler için).

  ### **Logic & Utilities**

* **State Management:** `Zustand` \- Teklif sepeti (Quote Basket) yönetimi için (Redux'tan çok daha hafif).  
* **Forms:** `React Hook Form` \+ `Zod` \- Tip güvenli form validasyonu.  
* **Date Handling:** `date-fns` \- Fuar tarihleri formatlaması için.  
* **Email:** `Resend SDK` \- Transaksiyonel e-postalar için.

  ## **2\. 🏗️ Proje ve Klasör Mimarisi (Monorepo-Style)**

Next.js ve Payload aynı projede yaşayacak. Önerilen klasör yapısı:

1. ertip-web/  
2. ├── .env                  \# Hassas değişkenler (DB URL, Secret Key)  
3. ├── next.config.mjs       \# Next.js konfigürasyonu  
4. ├── payload.config.ts     \# CMS ana konfigürasyonu  
5. ├── public/  
6. │   ├── assets/           \# Statik ikonlar, logo vs.  
7. │   └── media/            \# CMS'den yüklenen görseller (Local Storage)  
8. ├── src/  
9. │   ├── app/              \# Next.js App Router  
10. │   │   ├── (frontend)/   \# Web sitesi sayfaları (layout.tsx, page.tsx)  
11. │   │   │   ├── products/  
12. │   │   │   ├── quote/  
13. │   │   │   └── not-found.tsx  
14. │   │   ├── (payload)/    \# Admin panel route'ları (/admin)  
15. │   │   └── api/          \# GraphQL ve REST endpointleri  
16. │   ├── components/  
17. │   │   ├── blocks/       \# CMS Blokları (Hero, Content, vb.)  
18. │   │   ├── layout/       \# Header, Footer, MobileNav  
19. │   │   └── ui/           \# Shadcn bileşenleri (Button, Input, Sheet)  
20. │   ├── lib/              \# Yardımcı fonksiyonlar (utils.ts, date.ts)  
21. │   ├── payload/          \# CMS Mantığı  
22. │   │   ├── collections/  \# Products, Pages, Users, Media  
23. │   │   ├── globals/      \# Header, Footer, Settings  
24. │   │   └── blocks/       \# Blok şemaları (Fields config)  
25. │   └── store/            \# Zustand (useQuoteStore.ts)  
    

    ## **3\. 🧩 Blok Mimarisi (Page Builder Detayları)**

Admin panelinde sürükle-bırak yapılacak blokların teknik şemaları:

1. **HeroBlock:**  
   * `type`: 'hero'  
   * `title`: String (H1)  
   * `subtitle`: Textarea  
   * `backgroundImage`: Upload (Media)  
   * `ctaButton`: { label: String, url: String, style: 'primary' | 'outline' }  
2. **ProductGridBlock:**  
   * `type`: 'productGrid'  
   * `title`: String (Örn: "Öne Çıkan Mikroskoplar")  
   * `selectionType`: 'category' | 'manual'  
   * `category`: Relationship (Category) \- Eğer tip kategori ise.  
   * `products`: Relationship (Product \- Many) \- Eğer tip manuel ise.  
   * `limit`: Number (Varsayılan: 8\)  
3. **ContentBlock:**  
   * `type`: 'content'  
   * `layout`: 'full' | 'split-left' | 'split-right'  
   * `richText`: RichText (Payload Lexical Editor)  
   * `media`: Upload (Opsiyonel görsel/video)  
4. **SpecsBlock:**  
   * `type`: 'specs'  
   * `productSource`: 'current\_page' (Otomatik) | 'manual'  
5. **ContactFormBlock:**  
   * `type`: 'form'  
   * `subject`: String (Email başlığı için ön ek)

   ## **4\. 🗄️ Detaylı Veritabanı Şeması (Database Schema)**

   ### **Collection: `Products`**

* **slug:** Text (Unique, Index) \- URL için.  
* **title:** Text (Required).  
* **description:** RichText.  
* **category:** Relationship (Categories).  
* **gallery:** Array of Upload (Media).  
* **specs:** Group  
  * `brand`: Text  
  * `model`: Text  
  * `origin`: Text (Menşei)  
  * `custom`: Array (Key-Value Pair) \-\> { label: String, value: String }  
* **documents:** Array of Upload (PDF only).  
* **seo:** Group (Meta Title, Description, Keywords).  
* **\_status:** Draft / Published.

  ### **Collection: `Inquiries` (Gelen Talepler)**

* **status:** Select ('new', 'viewed', 'contacted', 'closed').  
* **customer:** Group  
  * `name`: Text  
  * `email`: Email  
  * `phone`: Text  
  * `company`: Text  
* **message:** Textarea.  
* **items:** JSON (Sepetteki ürünlerin ID ve Adet bilgisi snapshot'ı).  
* **gdprConsent:** Boolean (True olmak zorunda).

  ### **Global: `SiteSettings`**

* **logo:** Upload.  
* **contactInfo:** Group (Address, Phone, Email, Maps URL).  
* **socialMedia:** Array ({ platform: 'linkedin', url: String }).  
* **scripts:** Code (Google Analytics, Pixel vb. için head/body inject).

  ## **5\. ⚙️ DigitalOcean VPS Konfigürasyonu (DevOps)**

Sunucuya bağlanıp uygulanacak adım adım komutlar ve ayarlar.

### **A. Sunucu Hazırlığı (Ubuntu 24.04)**

26. \# 1\. Sistemi güncelle  
27. sudo apt update && sudo apt upgrade \-y  
28.   
29. \# 2\. Gerekli araçları kur  
30. sudo apt install curl git unzip nginx certbot python3-certbot-nginx \-y  
31.   
32. \# 3\. Node.js (LTS) Kurulumu  
33. curl \-fsSL \[https://deb.nodesource.com/setup\_20.x\](https://deb.nodesource.com/setup\_20.x) | sudo \-E bash \-  
34. sudo apt install \-y nodejs  
35.   
36. \# 4\. PM2 (Process Manager) Kurulumu  
37. sudo npm install \-g pm2  
38.   
39. \# 5\. PostgreSQL Kurulumu  
40. sudo apt install postgresql postgresql-contrib \-y  
41. \# (Daha sonra 'payload' kullanıcısı ve veritabanı oluşturulacak)  
    

    ### **B. Nginx Reverse Proxy Ayarı**

Next.js 3000 portunda çalışır, Nginx bunu 80/443'e yönlendirir. Dosya: `/etc/nginx/sites-available/ertip-web`

42. server {  
43.     server\_name ertipmedikal.com \[www.ertipmedikal.com\](https://www.ertipmedikal.com);  
44.   
45.     location / {  
46.         proxy\_pass http://localhost:3000;  
47.         proxy\_http\_version 1.1;  
48.         proxy\_set\_header Upgrade $http\_upgrade;  
49.         proxy\_set\_header Connection 'upgrade';  
50.         proxy\_set\_header Host $host;  
51.         proxy\_cache\_bypass $http\_upgrade;  
52.     }  
53.   
54.     \# Medya dosyaları için cache optimizasyonu  
55.     location /media/ {  
56.         alias /var/www/ertip-web/public/media/;  
57.         expires 30d;  
58.         access\_log off;  
59.     }  
60. }  
    

    ### **C. SSL Kurulumu**

61. sudo certbot \--nginx \-d ertipmedikal.com \-d \[www.ertipmedikal.com\](https://www.ertipmedikal.com)  
    

    ### **D. Environment Variables (`.env`)**

Sunucuda `.env` dosyasında olması gerekenler:

62. DATABASE\_URI=postgres://user:password@localhost:5432/ertip\_db  
63. PAYLOAD\_SECRET=cok\_gizli\_rastgele\_bir\_string  
64. NEXT\_PUBLIC\_SERVER\_URL=\[https://ertipmedikal.com\](https://ertipmedikal.com)  
65. RESEND\_API\_KEY=re\_123456789  
66. NODE\_ENV=production  
    

    ## **6\. 🛡️ Güvenlik ve Performans Önlemleri**

1. **Rate Limiting:** Next.js Middleware dosyasında (`middleware.ts`), aynı IP'den gelen form gönderimlerini (örneğin dakikada 5\) sınırla.  
2. **Secure Headers:** `next.config.mjs` içinde güvenlik başlıkları (X-DNS-Prefetch-Control, X-Frame-Options vb.) ayarlanacak.  
3. **Image Optimization:** Next.js `Image` bileşeni ve `sharp` kütüphanesi ile görseller sunucu tarafında WebP formatına çevrilip sıkıştırılacak.  
4. **Yedekleme (Backup) Scripti:**  
   * Sunucuda günlük çalışacak bir cron job.  
   * Postgres dump alır \-\> `pg_dump ertip_db > backup.sql`  
   * Medya klasörünü sıkıştırır \-\> `tar -czf media_backup.tar.gz public/media`  
   * Bu dosyaları güvenli bir yere kopyalar (veya sunucuda ayrı bir klasöre).

   ## **7\. 🚦 SEO Stratejisi (Technical SEO)**

* **Dinamik Sitemap:** `/app/sitemap.ts` dosyası her gece veya her buildde veritabanını tarayıp güncel ürün URL'lerini XML'e çevirecek.  
67. **Metadata Template:**  
    export const metadata \= {  
68.   title: {  
69.     template: '%s | Ertip Medikal',  
70.     default: 'Ertip Medikal \- Laboratuvar ve Cerrahi Çözümler',  
71.   },  
72.   // ...  
73. }  
*   
* **Canonical Tags:** Her ürün sayfasında kendini işaret eden canonical URL otomatik üretilecek.

  ## **8\. 🗓️ Uygulama Planı (Roadmap)**

1. **Faz 0: Ortam Kurulumu:** Yerel bilgisayarda `npx create-next-app` ile projenin başlatılması ve Payload entegrasyonu.  
2. **Faz 1: Backend (CMS):** Veritabanı şemalarının kodlanması ve admin panelinin ayağa kaldırılması.  
3. **Faz 2: Frontend (Blocks):** Blokların (Hero, Grid) kodlanması ve sayfaların oluşturulması.  
4. **Faz 3: VPS Kurulumu:** DigitalOcean sunucusunun kiralanıp yukarıdaki komutlarla hazırlanması.  
5. **Faz 4: Canlı Test & Deploy:** Projenin sunucuya atılması ve DNS yönlendirmesi.  
74.   
1. 