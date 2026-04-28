import { getPayload } from "payload";
import configPromise from "@payload-config";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ArrowRight, SlidersHorizontal } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Haberler ve Etkinlikler", // layout.tsx sonuna otomatik "| Ertip Medikal" ekleyecek
  description:
    "Ertip Medikal hakkındaki en güncel haberler, uluslararası fuarlar, etkinlikler ve sektörel duyurular.",
  openGraph: {
    title: "Haberler ve Etkinlikler",
    description:
      "Ertip Medikal hakkındaki en güncel haberler, uluslararası fuarlar, etkinlikler ve sektörel duyurular.",
    type: "website",
  },
};

type Args = {
  searchParams: Promise<{
    kategori?: string;
    sira?: string;
  }>;
};

export default async function NewsPage({ searchParams }: Args) {
  // Next.js 15'te searchParams bir Promise olarak gelir
  const resolvedParams = await searchParams;
  const aktifKategori = resolvedParams.kategori || "";
  const aktifSiralama = resolvedParams.sira || "yeni";

  const payload = await getPayload({ config: configPromise });

  // 1. Kategorileri Çek (Filtreleme Menüsü İçin)
  const { docs: categories } = await payload.find({
    collection: "news-categories",
    limit: 50,
  });

  // 2. Seçili Kategorinin ID'sini Bul
  let categoryId = null;
  if (aktifKategori) {
    const selectedCat = categories.find((c) => c.slug === aktifKategori);
    if (selectedCat) categoryId = selectedCat.id;
  }

  // 3. Haberleri Filtrelere Göre Çek
  const whereClause: any = { _status: { equals: "published" } };
  if (categoryId) {
    whereClause.category = { equals: categoryId };
  }

  const { docs: news } = await payload.find({
    collection: "news",
    where: whereClause,
    sort: aktifSiralama === "eski" ? "publishedDate" : "-publishedDate",
    depth: 2,
  });

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 min-h-screen">
      {/* Sayfa Başlığı */}
      <div className="max-w-3xl mx-auto text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
          Haberler ve Etkinlikler
        </h1>
        <p className="text-lg text-slate-600">
          Ertip Medikal'in katıldığı uluslararası fuarlar, eğitimler ve en
          güncel duyurular.
        </p>
      </div>

      {/* Filtreleme ve Sıralama Çubuğu */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        {/* Kategori Filtreleri */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-500 mr-2 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" /> Kategoriler:
          </span>
          <Link
            href={`/haberler?sira=${aktifSiralama}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!aktifKategori ? "bg-primary text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-200 border"}`}
          >
            Tümü
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/haberler?kategori=${cat.slug}&sira=${aktifSiralama}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${aktifKategori === cat.slug ? "bg-primary text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-200 border"}`}
            >
              {cat.title}
            </Link>
          ))}
        </div>

        {/* Sıralama Seçenekleri */}
        <div className="flex items-center gap-2">
          <Link
            href={`/haberler?kategori=${aktifKategori}&sira=yeni`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${aktifSiralama === "yeni" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-200"}`}
          >
            En Yeni
          </Link>
          <Link
            href={`/haberler?kategori=${aktifKategori}&sira=eski`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${aktifSiralama === "eski" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-200"}`}
          >
            En Eski
          </Link>
        </div>
      </div>

      {/* Haber Kartları Grid'i */}
      {news.length === 0 ? (
        <div className="text-center py-24 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
          <p className="text-xl text-slate-500 font-medium">
            Bu kriterlere uygun bir haber bulunamadı.
          </p>
          <Link
            href="/haberler"
            className="text-primary hover:underline mt-2 inline-block"
          >
            Filtreleri Temizle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item) => {
            const imageUrl =
              typeof item.image === "object" && item.image?.url
                ? item.image.url
                : "/placeholder.jpg";
            const formattedDate = new Date(
              item.publishedDate,
            ).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            const categoryTitle =
              typeof item.category === "object" ? item.category?.title : null;

            return (
              <Card
                key={item.id}
                className="group overflow-hidden rounded-[2rem] border-0 bg-white shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Resim Alanı (16:9 Oran ve Kaplama) */}
                <Link
                  href={`/haberler/${item.slug || item.id}`}
                  className="relative block aspect-[16/9] overflow-hidden"
                >
                  <Image
                    src={imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                  {/* Kategori Rozeti (Resmin Üzerinde) */}
                  {categoryTitle && (
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-white/90 text-primary hover:bg-white backdrop-blur-sm shadow-sm font-semibold px-3 py-1">
                        {categoryTitle}
                      </Badge>
                    </div>
                  )}
                  {/* Alttan Gelen Karanlık Degrade (Gradient) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>

                <CardContent className="p-8">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 font-medium">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <time>{formattedDate}</time>
                  </div>

                  <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    <Link href={`/haberler/${item.slug || item.id}`}>
                      {item.title}
                    </Link>
                  </h3>

                  {item.excerpt && (
                    <p className="text-slate-600 line-clamp-2 mb-6 text-md leading-relaxed">
                      {item.excerpt}
                    </p>
                  )}

                  <Link
                    href={`/haberler/${item.slug || item.id}`}
                    className="inline-flex items-center text-primary font-bold text-sm group/btn"
                  >
                    Haberi Oku
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
