import Link from "next/link";

export function AdminIcon() {
  return (
    <div className="ertip-admin-mark" aria-label="Ertip Medikal">
      <span>EM</span>
    </div>
  );
}

export function AdminLogo() {
  return (
    <div className="ertip-admin-logo" aria-label="Ertip Medikal Admin">
      <span className="ertip-admin-logo__mark">EM</span>
      <span className="ertip-admin-logo__text">
        <strong>Ertip Medikal</strong>
        <small>B2B Yönetim Portalı</small>
      </span>
    </div>
  );
}

export function AdminLoginIntro() {
  return (
    <section className="ertip-login-intro" aria-label="Ertip Medikal">
      <div className="ertip-login-intro__eyebrow">Kurumsal Yönetim Merkezi</div>
      <h1>Ertip Medikal Yönetim Paneli</h1>
      <p>
        Ürün kataloğu, içerik yapıları ve B2B operasyon kayıtları tek yönetim
        akışında toplanır.
      </p>
      <div className="ertip-login-intro__meta">
        <span>Payload CMS 3</span>
        <span>Next.js 15</span>
        <span>MDR uyumlu kayıtlar</span>
      </div>
    </section>
  );
}

export function AdminDashboardIntro() {
  return (
    <section className="ertip-dashboard-hero">
      <div>
        <span className="ertip-dashboard-hero__eyebrow">Yönetim Paneli</span>
        <h1>İçerik, ürün ve B2B operasyonları tek merkezde.</h1>
        <p>
          Kritik koleksiyonlara hızlı erişin, katalog içeriğini yönetin ve gelen
          talepleri kontrollü bir iş akışıyla takip edin.
        </p>
      </div>

      <div className="ertip-dashboard-hero__actions" aria-label="Hızlı erişim">
        <Link href="/admin/collections/products">Ürünler</Link>
        <Link href="/admin/collections/quote-requests">Teklif Talepleri</Link>
        <Link href="/admin/collections/pages">Sayfalar</Link>
      </div>
    </section>
  );
}

export function AdminNavIntro() {
  return (
    <div className="ertip-nav-intro">
      <span>Portal Durumu</span>
      <strong>Canlı yönetim</strong>
      <Link className="ertip-nav-dashboard-link" href="/admin">
        Dashboard
      </Link>
    </div>
  );
}

export function AdminHeaderBadge() {
  return (
    <a className="ertip-admin-site-link" href="/" target="_blank">
      Siteyi Görüntüle
    </a>
  );
}
