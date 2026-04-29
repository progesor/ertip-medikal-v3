"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useSearchParams, ReadonlyURLSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Info,
  ShoppingCart,
  Award,
  PlayCircle,
  PackageOpen,
  Ruler,
  FileText,
  AlertCircle,
  X,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useCart } from "@/providers/CartProvider";

function getYouTubeId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function ProductView({ product }: any) {
  const { addToCart } = useCart();
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(
    {},
  );
  const [manualCode, setManualCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // YENİ STATE'LER: Hata ve Başarı Durumları İçin
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifiedDoc, setVerifiedDoc] = useState<{
    url: string;
    label: string;
  } | null>(null);

  // TS2339 Hatası Çözümü: Tip zorlaması ve optional chaining (?)
  const searchParams = useSearchParams() as ReadonlyURLSearchParams | null;
  const activeTab = searchParams?.get("tab") || "description";
  const autoCode = searchParams?.get("code");

  const currentVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    return product.variants.find((v: any) => {
      return Object.values(selectedAttrs).every((val) => v.title.includes(val));
    });
  }, [selectedAttrs, product.variants]);

  useEffect(() => {
    if (activeTab === "docs" && autoCode) {
      if (product.protectedDocs && product.protectedDocs.length > 0) {
        handleVerify(product.protectedDocs[0].label, autoCode);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCode, activeTab]);

  const handleAddToCart = () => {
    const itemToAdd = {
      id: product.id,
      title: product.title,
      slug: product.slug,
      variant: currentVariant?.title || "Standart",
      sku: currentVariant?.sku || product.sku,
      image:
        typeof product.mainImage === "object" ? product.mainImage?.url : "",
    };
    addToCart(itemToAdd);
  };

  const handleVerify = async (docLabel: string, codeInput?: string) => {
    setIsVerifying(true);
    setVerifyError(null);
    const codeToVerify = codeInput || manualCode;

    try {
      const res = await fetch("/api/verify-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          code: codeToVerify,
          docLabel,
        }),
      });
      const data = await res.json();

      if (data.success) {
        // Popup blocker'a takılmamak için tarayıcıda yeni pencere açmıyor, kendi UI'mıza alıyoruz
        setVerifiedDoc({ url: data.fileUrl, label: docLabel });
      } else {
        setVerifyError(data.message || "Geçersiz kod.");
        setTimeout(() => setVerifyError(null), 5000); // 5 Saniye sonra hatayı gizle
      }
    } catch {
      setVerifyError(
        "Doğrulama servisine ulaşılamadı. Lütfen internet bağlantınızı kontrol edin.",
      );
      setTimeout(() => setVerifyError(null), 5000);
    } finally {
      setIsVerifying(false);
    }
  };

  const videoId = getYouTubeId(product.videoUrl || "");
  const pos = product.logisticDisplayPosition || "below";

  const NetDimensions = ({ mode }: { mode: "sidebar" | "wide" }) => {
    if (!product.width && !product.height && !product.depth && !product.weight)
      return null;

    if (mode === "sidebar") {
      return (
        <div className="bg-surface p-6 rounded-4xl border border-surface-muted space-y-4">
          <h4 className="font-bold flex items-center gap-2 text-md text-content-strong">
            <Ruler className="text-primary w-4 h-4" /> Net Ürün Boyutları
          </h4>
          <ul className="space-y-2 text-sm">
            {(product.width || product.height || product.depth) && (
              <li className="flex justify-between border-b border-surface-strong pb-2">
                <span className="text-content-muted">Ölçüler (G-Y-D):</span>
                <strong className="text-content-strong">
                  {product.width || "-"}x{product.height || "-"}x
                  {product.depth || "-"} mm
                </strong>
              </li>
            )}
            {product.weight && (
              <li className="flex justify-between pt-1">
                <span className="text-content-muted">Net Ağırlık:</span>
                <strong className="text-content-strong">{product.weight} gr</strong>
              </li>
            )}
          </ul>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-content-strong flex items-center gap-2">
          <div className="w-1.5 h-6 bg-primary rounded-full" /> Ürün Boyut ve
          Ağırlığı (Net)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Genişlik", value: product.width, unit: "mm" },
            { label: "Yükseklik", value: product.height, unit: "mm" },
            { label: "Derinlik", value: product.depth, unit: "mm" },
            { label: "Net Ağırlık", value: product.weight, unit: "gr" },
          ].map(
            (item, idx) =>
              item.value && (
                <div
                  key={idx}
                  className="bg-white border border-surface-muted p-5 rounded-2xl shadow-sm"
                >
                  <p className="text-xs text-content-subtle font-bold uppercase tracking-wider mb-1">
                    {item.label}
                  </p>
                  <p className="text-lg font-black text-content-strong">
                    {item.value}{" "}
                    <span className="text-sm font-normal text-content-muted">
                      {item.unit}
                    </span>
                  </p>
                </div>
              ),
          )}
        </div>
      </div>
    );
  };

  const PackagingTable = ({ mode }: { mode: "sidebar" | "wide" }) => {
    if (!product.packaging || product.packaging.length === 0) return null;

    if (mode === "sidebar") {
      return (
        <div className="bg-surface p-6 rounded-4xl border border-surface-muted space-y-4">
          <h4 className="font-bold flex items-center gap-2 text-md text-content-strong">
            <PackageOpen className="text-primary w-4 h-4" /> Lojistik Bilgisi
          </h4>
          <div className="space-y-3">
            {product.packaging.map((p: any, i: number) => (
              <div
                key={i}
                className="text-sm border-b border-surface-strong pb-3 last:border-0 last:pb-0"
              >
                <p className="font-bold text-content-strong mb-1">
                  {p.packageLabel}{" "}
                  <span className="text-primary">({p.quantity} Adet)</span>
                </p>
                <p className="text-content-muted text-xs">
                  Boyut: {p.p_width}x{p.p_height}x{p.p_depth} cm
                </p>
                <p className="text-content-muted text-xs mt-0.5">
                  Brüt Ağırlık:{" "}
                  <strong className="text-content">{p.grossWeight} kg</strong>
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 mt-10">
        <h3 className="text-xl font-bold text-content-strong flex items-center gap-2">
          <div className="w-1.5 h-6 bg-primary rounded-full" /> Lojistik ve
          Ambalaj Bilgileri
        </h3>
        <div className="overflow-hidden rounded-4xl border border-surface-muted shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-surface border-b border-surface-muted">
              <tr>
                <th className="px-6 py-4 font-bold text-content-strong">
                  Paketleme Formu
                </th>
                <th className="px-6 py-4 font-bold text-content-strong">
                  İçerik Adedi
                </th>
                <th className="px-6 py-4 font-bold text-content-strong">
                  Ölçüler (cm)
                </th>
                <th className="px-6 py-4 font-bold text-content-strong">
                  Brüt Ağırlık
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {product.packaging.map((p: any, i: number) => (
                <tr key={i} className="hover:bg-surface-subtle transition-colors">
                  <td className="px-6 py-4 font-bold text-content-strong">
                    {p.packageLabel}
                  </td>
                  <td className="px-6 py-4 text-content">
                    {p.quantity} Adet
                  </td>
                  <td className="px-6 py-4 font-mono text-content-muted">
                    {p.p_width}x{p.p_height}x{p.p_depth}
                  </td>
                  <td className="px-6 py-4 text-content-strong font-bold">
                    {p.grossWeight} kg
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl pt-12 relative">
      {/* GÖRÜNTÜLEYİCİ MODAL */}
      {verifiedDoc && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-brand-dark/95 backdrop-blur-md p-2 sm:p-8">
          <div className="bg-white flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-t-3xl max-w-6xl w-full mx-auto shadow-2xl gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-content-strong flex items-center gap-2 line-clamp-1">
                <FileText className="w-5 h-5 text-primary shrink-0" />{" "}
                {verifiedDoc.label}
              </h3>
              {/* YENİ: Bilgilendirme Notu */}
              <p className="text-[10px] md:text-xs text-content-subtle flex items-center gap-1.5 italic">
                <Info className="w-3 h-3 text-content-subtle" />
                Dosyayı cihazınıza kaydetmek için İndir butonuna sağ tıklayıp
                "Bağlantıyı farklı kaydet" seçeneğini kullanabilirsiniz.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {/* İndirme Butonu */}
              <a
                href={verifiedDoc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-sm"
              >
                <Download className="w-4 h-4" /> İndir / Yeni Sekmede Aç
              </a>

              <button
                onClick={() => setVerifiedDoc(null)}
                className="p-2.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-2xl transition-all"
                title="Kapat"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tarayıcı içi Görüntüleyici (iframe) */}
          <div className="bg-surface-strong flex-1 max-w-6xl w-full mx-auto rounded-b-3xl overflow-hidden shadow-2xl relative">
            <iframe
              src={`${verifiedDoc.url}#toolbar=0`}
              className="w-full h-full border-none"
              title={verifiedDoc.label}
            />
          </div>
        </div>
      )}

      {/* HATA TOAST BİLDİRİMİ (BAŞARISIZ GİRİŞ) */}
      <AnimatePresence>
        {verifyError && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[110] bg-white p-4 rounded-2xl shadow-2xl border-l-4 border-l-red-500 flex items-center gap-3 min-w-[300px]"
          >
            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-content-strong">
                Erişim Reddedildi
              </p>
              <p className="text-xs text-content-muted">{verifyError}</p>
            </div>
            <button
              onClick={() => setVerifyError(null)}
              className="text-content-subtle hover:text-content-strong p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
        <div className="space-y-4">
          <div className="relative aspect-square rounded-6xl overflow-hidden bg-surface border border-surface-muted p-12">
            <Image
              src={product.mainImage?.url || "/placeholder.jpg"}
              alt={product.title}
              fill
              className="object-contain p-8"
            />
          </div>
          {product.gallery && product.gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {product.gallery.map((item: any, i: number) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-surface border border-surface-muted cursor-pointer hover:border-primary transition-colors"
                >
                  <Image
                    src={item.image?.url}
                    alt={product.title}
                    fill
                    className="object-contain p-2"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-content-strong mb-4">
              {product.title}
            </h1>
            <div className="flex items-center gap-4">
              <span className="bg-surface-muted text-content px-3 py-1 rounded-full text-xs font-mono font-bold">
                SKU: {currentVariant?.sku || product.sku || "Belirtilmedi"}
              </span>
              <span className="text-primary text-sm font-bold flex items-center gap-1">
                <Award className="w-4 h-4" /> Orijinal Ertip Ürünü
              </span>
            </div>
          </div>

          {product.shortDescription && (
            <p className="text-content-muted leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {product.attributes && product.attributes.length > 0 && (
            <div className="space-y-6 pt-4">
              {product.attributes.map((attr: any, i: number) => {
                const values = attr.values
                  .split("-")
                  .map((v: string) => v.trim());
                return (
                  <div key={i} className="space-y-3">
                    <label className="text-sm font-bold text-content-strong uppercase tracking-wider">
                      {attr.name} Seçimi
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {values.map((val: string) => (
                        <button
                          key={val}
                          onClick={() =>
                            setSelectedAttrs((prev) => ({
                              ...prev,
                              [attr.name]: val,
                            }))
                          }
                          className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${selectedAttrs[attr.name] === val
                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                            : "bg-white border-surface-strong text-content hover:border-primary hover:text-primary"
                            }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="h-16 px-10 rounded-2xl text-lg font-bold flex-1"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 w-6 h-6" /> Teklif Sepetine Ekle
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 mb-12 flex-wrap gap-y-4">
          <TabsTrigger
            value="description"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 md:px-8 py-4 font-bold text-base md:text-lg"
          >
            Açıklama
          </TabsTrigger>

          {product.variants && product.variants.length > 0 && (
            <TabsTrigger
              value="variants"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 md:px-8 py-4 font-bold text-base md:text-lg"
            >
              Tüm Modeller (SKU)
            </TabsTrigger>
          )}

          {videoId && (
            <TabsTrigger
              value="video"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 md:px-8 py-4 font-bold text-base md:text-lg flex items-center gap-2"
            >
              <PlayCircle className="w-5 h-5" /> Tanıtım Videosu
            </TabsTrigger>
          )}

          {((product.publicDocs && product.publicDocs.length > 0) ||
            (product.protectedDocs && product.protectedDocs.length > 0)) && (
              <TabsTrigger
                value="docs"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 md:px-8 py-4 font-bold text-base md:text-lg flex items-center gap-2"
              >
                <FileText className="w-5 h-5" /> Dokümanlar
              </TabsTrigger>
            )}
        </TabsList>

        <TabsContent value="description" className="max-w-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2 text-content leading-relaxed space-y-8">
              {product.description ? (
                <div
                  className="prose prose-slate prose-lg max-w-none
                                    prose-headings:text-content-strong
                                    prose-a:text-primary hover:prose-a:text-primary/80
                                    prose-img:rounded-4xl prose-img:border prose-img:border-surface-muted
                                    prose-table:border-collapse prose-table:w-full
                                    prose-th:bg-surface prose-th:p-4
                                    prose-td:p-4 prose-td:border-b prose-td:border-surface-muted

                                    prose-code:bg-surface-muted prose-code:text-content
                                    prose-code:px-2.5 prose-code:py-1 prose-code:rounded-lg
                                    prose-code:font-mono prose-code:text-sm prose-code:font-bold
                                    prose-code:before:hidden prose-code:after:hidden
                                "
                >
                  {typeof product.description === "string" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {product.description}
                    </ReactMarkdown>
                  ) : (
                    <div className="p-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl">
                      ⚠️ Bu ürünün açıklaması eski formatta (Lexical) kayıtlı
                      kalmış. Lütfen Admin panelinden bu ürünü düzenleyip
                      açıklamasını HTML/Markdown olarak yeniden yapıştırıp
                      kaydedin.
                    </div>
                  )}
                </div>
              ) : (
                <p className="italic text-content-subtle">
                  Bu ürün için detaylı bir açıklama girilmemiştir.
                </p>
              )}

              {(pos === "below" || pos === "both") && (
                <div className="mt-16 space-y-12 border-t border-surface-muted pt-10">
                  <NetDimensions mode="wide" />
                  <PackagingTable mode="wide" />
                </div>
              )}
            </div>

            <div className="space-y-6 sticky top-24">
              {product.specs && product.specs.length > 0 && (
                <div className="bg-surface p-8 rounded-4xl border border-surface-muted space-y-6">
                  <h4 className="font-bold flex items-center gap-2 text-lg">
                    <Info className="text-primary w-5 h-5" /> Temel Özellikler
                  </h4>
                  <ul className="space-y-4 text-sm">
                    {product.specs.map((spec: any, i: number) => (
                      <li
                        key={i}
                        className="flex justify-between items-center border-b border-surface-strong pb-3 last:border-0 last:pb-0"
                      >
                        <span className="text-content-muted">{spec.key}:</span>
                        <strong className="text-content-strong text-right max-w-[60%]">
                          {spec.value}
                        </strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(pos === "sidebar" || pos === "both") && (
                <>
                  <NetDimensions mode="sidebar" />
                  <PackagingTable mode="sidebar" />
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {product.variants && product.variants.length > 0 && (
          <TabsContent value="variants">
            <div className="overflow-x-auto rounded-4xl border border-surface-muted shadow-sm">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-surface border-b border-surface-muted">
                  <tr>
                    <th className="px-6 py-4 font-bold text-content-strong">
                      Varyant Modeli
                    </th>
                    <th className="px-6 py-4 font-bold text-content-strong">
                      Ürün Kodu (SKU)
                    </th>
                    <th className="px-6 py-4 font-bold text-content-strong">
                      Durum
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {product.variants.map((v: any, i: number) => (
                    <tr
                      key={i}
                      className={`hover:bg-surface-subtle transition-colors ${currentVariant?.sku === v.sku ? "bg-primary/5" : ""}`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-content">
                        {v.title}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-primary font-bold">
                        {v.sku}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="flex items-center gap-1 text-green-600 font-bold">
                          <Check className="w-4 h-4" /> Stokta Var
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        )}

        {videoId && (
          <TabsContent value="video" className="pt-4">
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video w-full rounded-4xl overflow-hidden shadow-xl border border-surface-strong bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                  title={`${product.title} Tanıtım Videosu`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          </TabsContent>
        )}

        <TabsContent value="docs" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-content-strong flex items-center gap-2 italic">
                <Info className="w-5 h-5 text-primary" /> Tanıtım Materyalleri
              </h3>
              {product.publicDocs?.map((doc: any, i: number) => (
                <a
                  key={i}
                  href={doc.file.url}
                  target="_blank"
                  className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-surface-muted hover:border-primary transition-all group"
                >
                  <span className="font-medium text-content">
                    {doc.label}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="group-hover:text-primary"
                  >
                    İndir
                  </Button>
                </a>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-content-strong flex items-center gap-2 italic">
                <Award className="w-5 h-5 text-primary" /> Teknik Dokümantasyon
                (MDR)
              </h3>
              {product.protectedDocs?.map((doc: any, i: number) => (
                <div
                  key={i}
                  className="p-4 bg-white rounded-2xl border-2 border-dashed border-surface-strong"
                >
                  <p className="font-bold text-content-strong mb-3">{doc.label}</p>
                  <div className="flex gap-2 relative">
                    <input
                      type="text"
                      placeholder="Erişim Kodu / Seri No"
                      className="flex-1 px-3 py-2 rounded-xl border border-surface-strong text-sm outline-none focus:border-primary"
                      onChange={(e) => setManualCode(e.target.value)}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleVerify(doc.label)}
                      disabled={isVerifying}
                    >
                      {isVerifying ? "..." : "Eriş"}
                    </Button>
                  </div>
                  <p className="text-[10px] text-content-subtle mt-2 italic">
                    * Bu belgeye erişiminiz kayıt altına alınmaktadır.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
