import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  FileText,
  FolderTree,
  ImageIcon,
  MessageSquareText,
  Package,
  PackagePlus,
  Settings2,
  ShoppingCart,
} from "lucide-react";
import type { ServerProps } from "payload";

const quickActions = [
  {
    href: "/admin/collections/products/create",
    label: "Yeni ürün ekle",
    description: "Ürün bilgileri, görseller ve varyantlar",
    icon: PackagePlus,
    primary: true,
  },
  {
    href: "/admin/collections/products",
    label: "Ürünleri yönet",
    description: "Ara, filtrele ve mevcut ürünleri düzenle",
    icon: Package,
  },
  {
    href: "/admin/collections/categories",
    label: "Kategorileri düzenle",
    description: "Katalog yapısı ve ürün sıralaması",
    icon: FolderTree,
  },
  {
    href: "/admin/globals/site-settings",
    label: "Site ayarları",
    description: "Logo, başlık ve iletişim seçenekleri",
    icon: Settings2,
  },
];

function getProductImage(product: Record<string, any>) {
  const image = product.mainImage;

  if (!image || typeof image !== "object") return null;

  return image.sizes?.thumbnail?.url || image.url || null;
}

export default async function AdminDashboard({ payload, user }: ServerProps) {
  const [
    products,
    categories,
    media,
    pages,
    inquiries,
    quoteRequests,
    recentProducts,
  ] = await Promise.all([
    payload.count({ collection: "products" }),
    payload.count({ collection: "categories" }),
    payload.count({ collection: "media" }),
    payload.count({ collection: "pages" }),
    payload.count({
      collection: "inquiries",
      where: { status: { equals: "unread" } },
    }),
    payload.count({
      collection: "quote-requests",
      where: { status: { equals: "new" } },
    }),
    payload.find({
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
    { label: "Toplam ürün", value: products.totalDocs, icon: Package },
    { label: "Kategori", value: categories.totalDocs, icon: FolderTree },
    { label: "Medya dosyası", value: media.totalDocs, icon: ImageIcon },
    { label: "İçerik sayfası", value: pages.totalDocs, icon: FileText },
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

      <section className="ertip-dashboard__stats" aria-label="İçerik özeti">
        {stats.map(({ icon: Icon, label, value }) => (
          <article key={label}>
            <span className="ertip-dashboard__stat-icon">
              <Icon size={19} />
            </span>
            <div>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </article>
        ))}
      </section>

      <div className="ertip-dashboard__columns">
        <section className="ertip-dashboard__panel">
          <div className="ertip-dashboard__panel-heading">
            <div>
              <span className="ertip-dashboard__eyebrow">Katalog</span>
              <h2>Son düzenlenen ürünler</h2>
            </div>
            <Link href="/admin/collections/products">Tümünü gör</Link>
          </div>

          <div className="ertip-dashboard__product-list">
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
                    <small>{product.sku || "Ana SKU tanımlanmamış"}</small>
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
              <span className="ertip-dashboard__eyebrow">Kısayollar</span>
              <h2>Sık kullanılan işlemler</h2>
            </div>
          </div>

          <div className="ertip-dashboard__quick-actions">
            {quickActions.map(
              ({ description, href, icon: Icon, label, primary }) => (
                <Link
                  className={primary ? "is-primary" : undefined}
                  href={href}
                  key={href}
                >
                  <span>
                    <Icon size={19} />
                  </span>
                  <div>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </div>
                  <ArrowRight size={16} />
                </Link>
              ),
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
