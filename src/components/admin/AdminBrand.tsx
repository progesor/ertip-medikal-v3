import type { ServerProps } from "payload";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

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

export function AdminLoginHeading({ i18n }: ServerProps) {
  return (
    <h1 className="ertip-login-heading">
      {i18n.language === "en"
        ? "Sign in to your account"
        : "Hesabınıza giriş yapın"}
    </h1>
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

export function AdminNavHome() {
  return (
    <Link
      href="/admin"
      className="ertip-nav-home"
      aria-label="Yönetim ana sayfası"
    >
      <AdminLogo />
    </Link>
  );
}

export function AdminNavFooter() {
  return (
    <div className="ertip-admin-nav-footer">
      <a href="/" target="_blank" rel="noreferrer">
        Web sitesini görüntüle
        <ExternalLink aria-hidden="true" size={15} />
      </a>
    </div>
  );
}
