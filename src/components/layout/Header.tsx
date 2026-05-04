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
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 shadow-sm shadow-surface-inverse/5 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 flex min-h-[4.5rem] items-center justify-between gap-4 py-3">
        {/* Logo Alanı */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] border border-primary/15 bg-primary/10 shadow-sm shadow-primary/10">
              <span className="h-4 w-4 rounded-full bg-primary shadow-[0_0_0_6px_hsl(var(--primary)/0.12)]" />
            </span>
            <span className="leading-tight">
              <span className="block text-xl font-black tracking-tight text-text-main">
                Ertip Medikal
              </span>
              <span className="hidden text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted sm:block">
                Medical Instruments
              </span>
            </span>
          </Link>
        </div>

        {/* Masaüstü Navigasyon (Veritabanından Çekiliyor) */}
        <nav className="hidden md:flex items-center gap-1 rounded-[var(--radius-xl)] border border-border/70 bg-surface/80 p-1 text-sm font-semibold shadow-sm shadow-surface-inverse/5">
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
                className="rounded-[var(--radius)] px-3 py-2 text-text-muted transition-colors hover:bg-primary/10 hover:text-primary"
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
