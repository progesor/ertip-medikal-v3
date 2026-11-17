import Link from "next/link";
import Image from "next/image";
import { ContentReviewShortcuts } from "./ProductContentReview";
import {
  ArrowRight,
  Archive,
  FileText,
  FolderTree,
  Plug,
  ImageIcon,
  MessageSquareText,
  Package,
  PackagePlus,
  Settings2,
  ShoppingCart,
} from "lucide-react";
import { isAdmin } from "@/access/roles";
import type { ServerProps } from "payload";

const quickActions = [
  {
    href: "/admin/collections/users/yedekler",
    label: "Yedekleme ve taşıma",
    description: "Siteyi yedekle, indir veya geri yükle",
    icon: Archive,
    adminOnly: true,
  },
  {
    href: "/admin/collections/products",
    label: "Ürünleri yönet",
    description: "Ara, filtrele ve mevcut ürünleri düzenle",
    icon: Package,
  },
  {
    href: "/admin/collections/pages",
    label: "Sayfaları düzenle",
    description: "Sitede yayımlanan metinler ve görseller",
    icon: FileText,
  },
  {
    href: "/admin/globals/site-settings",
    label: "Site ayarları",
    description: "Logo, başlık ve iletişim seçenekleri",
    icon: Settings2,
  },
  {
    href: "/admin/collections/payload-mcp-api-keys",
    label: "MCP bağlantıları",
    description: "Bağlı uygulamalar ve erişim izinleri",
    icon: Plug,
    adminOnly: true,
  },
];

function getProductImage(product: Record<string, any>) {
  const image = product.mainImage;

  if (!image || typeof image !== "object") return null;

  return image.sizes?.thumbnail?.url || image.url || null;
}

export default async function AdminDashboard({
  payload,
  user,
  locale,
}: ServerProps) {
  if (user?.collection !== "users") return null;
  const access = { user, overrideAccess: false } as const;
  const showRequests = isAdmin(user);
  const [
    products,
    categories,
    media,
    pages,
    inquiries,
    quoteRequests,
    recentProducts,
  ] = await Promise.all([
    payload.count({ ...access, collection: "products" }),
    payload.count({ ...access, collection: "categories" }),
    payload.count({ ...access, collection: "media" }),
    payload.count({ ...access, collection: "pages" }),
    showRequests
      ? payload.count({
          ...access,
          collection: "inquiries",
          where: { status: { equals: "unread" } },
        })
      : null,
    showRequests
      ? payload.count({
          ...access,
          collection: "quote-requests",
          where: { status: { equals: "new" } },
        })
      : null,
    payload.find({
      ...access,
      locale: locale?.code === "en" ? "en" : "tr",
      draft: true,
      select: { title: true, mainImage: true, updatedAt: true, _status: true },
      collection: "products",
      depth: 1,
      limit: 5,
      sort: "-updatedAt",
    }),
  ]);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Yönetici";

  const stats = [
    {
      label: "Toplam ürün",
      href: "/admin/collections/products",
      value: products.totalDocs,
      icon: Package,
    },
    {
      label: "Kategori",
      href: "/admin/collections/categories",
      value: categories.totalDocs,
      icon: FolderTree,
    },
    {
      label: "Medya dosyası",
      href: "/admin/collections/media",
      value: media.totalDocs,
      icon: ImageIcon,
    },
    {
      label: "İçerik sayfası",
      href: "/admin/collections/pages",
      value: pages.totalDocs,
      icon: FileText,
    },
  ];

  return (
    <div className="ertip-dashboard">
      <section className="ertip-dashboard__hero">
        <div>
          <span className="ertip-dashboard__eyebrow">Yönetim merkezi</span>
          <h1>Hoş geldiniz, {displayName}</h1>
          <p>
            Ürün kataloğunu, içerikleri ve müşteri taleplerini tek noktadan
            yönetin.
          </p>
        </div>
        <Link
          className="ertip-dashboard__primary-action"
          href="/admin/collections/products/create"
        >
          <PackagePlus size={18} />
          Yeni ürün ekle
        </Link>
      </section>

      {quoteRequests && inquiries && (
        <section
          className="ertip-dashboard__attention"
          aria-label="Bekleyen işler"
        >
          <Link href="/admin/collections/quote-requests?where[status][equals]=new">
            <ShoppingCart size={20} />
            <span>
              <strong>{quoteRequests.totalDocs}</strong>
              Yeni teklif talebi
            </span>
            <ArrowRight size={17} />
          </Link>
          <Link href="/admin/collections/inquiries?where[status][equals]=unread">
            <MessageSquareText size={20} />
            <span>
              <strong>{inquiries.totalDocs}</strong>
              Yeni iletişim mesajı
            </span>
            <ArrowRight size={17} />
          </Link>
        </section>
      )}

      <section className="ertip-dashboard__stats" aria-label="İçerik özeti">
        {stats.map(({ icon: Icon, label, value, href }) => (
          <Link href={href} key={label}>
            <span className="ertip-dashboard__stat-icon">
              <Icon size={19} />
            </span>
            <div>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </Link>
        ))}
      </section>

      <ContentReviewShortcuts />

      <div className="ertip-dashboard__columns">
        <section className="ertip-dashboard__panel">
          <div className="ertip-dashboard__panel-heading">
            <div>
              <h2>Son çalışılan ürünler</h2>
            </div>
            <Link href="/admin/collections/products">Tümünü gör</Link>
          </div>

          <div className="ertip-dashboard__product-list">
            {recentProducts.docs.length === 0 && (
              <div className="ertip-dashboard__empty">
                <Package size={28} aria-hidden="true" />
                <p>İlk ürününüzü eklediğinizde burada görünecek.</p>
              </div>
            )}
            {recentProducts.docs.map((product) => {
              const imageUrl = getProductImage(product);

              return (
                <Link
                  href={`/admin/collections/products/${product.id}`}
                  key={product.id}
                >
                  <span className="ertip-dashboard__product-image">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt=""
                        width={44}
                        height={44}
                        unoptimized
                      />
                    ) : (
                      <Package size={20} />
                    )}
                  </span>
                  <span className="ertip-dashboard__product-copy">
                    <strong>{product.title}</strong>
                    <small>
                      {new Intl.DateTimeFormat("tr-TR", {
                        dateStyle: "medium",
                        timeZone: "Europe/Istanbul",
                      }).format(new Date(product.updatedAt))}
                    </small>
                  </span>
                  <span
                    className={`ertip-dashboard__status ertip-dashboard__status--${product._status || "draft"}`}
                  >
                    {product._status === "published" ? "Yayında" : "Taslak"}
                  </span>
                  <ArrowRight size={16} />
                </Link>
              );
            })}
          </div>
        </section>

        <section className="ertip-dashboard__panel">
          <div className="ertip-dashboard__panel-heading">
            <div>
              <h2>Hızlı işlemler</h2>
            </div>
          </div>

          <div className="ertip-dashboard__quick-actions">
            {quickActions
              .filter((action) => !action.adminOnly || isAdmin(user))
              .map(({ description, href, icon: Icon, label }) => (
                <Link href={href} key={href}>
                  <span>
                    <Icon size={19} />
                  </span>
                  <div>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </div>
                  <ArrowRight size={16} />
                </Link>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
