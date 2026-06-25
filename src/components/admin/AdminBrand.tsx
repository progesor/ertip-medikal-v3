import React from "react";

export function AdminLogo() {
  return (
    <div className="ertip-admin-brand ertip-admin-brand--full">
      <span className="ertip-admin-brand__mark" aria-hidden="true">
        <span />
        <span />
      </span>
      <span className="ertip-admin-brand__copy">
        <strong>Ertip Medikal</strong>
        <small>İçerik Yönetim Merkezi</small>
      </span>
    </div>
  );
}

export function AdminIcon() {
  return (
    <span
      className="ertip-admin-brand ertip-admin-brand--icon"
      aria-label="Ertip Medikal"
    >
      <span className="ertip-admin-brand__mark" aria-hidden="true">
        <span />
        <span />
      </span>
    </span>
  );
}

export function AdminNavFooter() {
  return (
    <div className="ertip-admin-nav-footer">
      <span className="ertip-admin-nav-footer__eyebrow">Hızlı erişim</span>
      <a href="/" target="_blank" rel="noreferrer">
        Web sitesini görüntüle
        <span aria-hidden="true">↗</span>
      </a>
      <p>Ürün ve içerik değişikliklerini yayınlamadan önce önizleyin.</p>
    </div>
  );
}
