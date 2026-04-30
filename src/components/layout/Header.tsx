import Link from "next/link";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { HeaderActions } from "@/components/layout/HeaderActions"; // YENİ EKLENDİ

// Artık asenkron bir Server Component olarak kalmaya devam ediyor
export async function Header() {
  const payload = await getPayload({ config: configPromise });

  const mainMenu = await payload.findGlobal({
    slug: "main-menu",
    depth: 1,
  });

  const navItems = mainMenu?.items || [];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between gap-4">
        {/* Logo Alanı */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">
              Ertip Medikal
            </span>
          </Link>
        </div>

        {/* Masaüstü Navigasyon (Veritabanından Çekiliyor) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item: any, idx: number) => {
            let href = "#";
            if (item.type === "custom" && item.url) {
              href = item.url;
            } else if (
              item.type === "reference" &&
              typeof item.reference === "object" &&
              item.reference !== null
            ) {
              href = `/${item.reference.slug}`;
            }

            return (
              <Link
                key={idx}
                href={href}
                className="transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Etkileşimli Sağ Kısım (Arama, Sepet ve Buton) */}
        <HeaderActions />
      </div>
    </header>
  );
}
