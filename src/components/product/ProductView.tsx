"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Award,
  Check,
  Download,
  FileText,
  Info,
  PackageOpen,
  PlayCircle,
  Ruler,
  ShoppingCart,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { ProductGallery } from "@/components/product/ProductGallery";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/providers/CartProvider";
import { useUiDictionary } from "@/providers/SiteLocaleProvider";

type LogisticsMode = "sidebar" | "wide";

type LogisticsProps = {
  mode: LogisticsMode;
  product: any;
};

type VerificationResponse = {
  success?: boolean;
  fileUrl?: string;
  message?: string;
};

function getYouTubeId(url: string) {
  if (!url) return null;

  const expression =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(expression);

  return match && match[2].length === 11 ? match[2] : null;
}

function getInitialSelectedAttributes(product: any) {
  if (!Array.isArray(product.attributes)) return {};

  const firstVariantTitle = String(product.variants?.[0]?.title || "");

  return product.attributes.reduce(
    (selected: Record<string, string>, attribute: any) => {
      if (!attribute?.name || typeof attribute.values !== "string") {
        return selected;
      }

      const values = attribute.values
        .split("-")
        .map((value: string) => value.trim())
        .filter(Boolean);
      const matchingValue = [...values]
        .sort((first, second) => second.length - first.length)
        .find(
          (value) =>
            firstVariantTitle.includes(`${value} mm ${attribute.name}`) ||
            firstVariantTitle.includes(value),
        );

      if (matchingValue || values[0]) {
        selected[attribute.name] = matchingValue || values[0];
      }

      return selected;
    },
    {},
  );
}

function NetDimensions({ mode, product }: LogisticsProps) {
  const dictionary = useUiDictionary();

  if (!product.width && !product.height && !product.depth && !product.weight) {
    return null;
  }

  if (mode === "sidebar") {
    return (
      <div className="space-y-4 rounded-2xl border border-border bg-surface-muted p-6">
        <h4 className="flex items-center gap-2 text-md font-bold text-text-main">
          <Ruler className="h-4 w-4 text-primary" />
          {dictionary.product.netDimensions}
        </h4>
        <ul className="space-y-2 text-sm">
          {(product.width || product.height || product.depth) && (
            <li className="flex justify-between border-b border-border pb-2">
              <span className="text-text-muted">
                {dictionary.product.dimensionsShort}
              </span>
              <strong className="text-text-main">
                {product.width || "-"}x{product.height || "-"}x
                {product.depth || "-"} mm
              </strong>
            </li>
          )}
          {product.weight && (
            <li className="flex justify-between pt-1">
              <span className="text-text-muted">
                {dictionary.product.netWeight}
              </span>
              <strong className="text-text-main">{product.weight} gr</strong>
            </li>
          )}
        </ul>
      </div>
    );
  }

  const dimensions = [
    { label: dictionary.product.width, value: product.width, unit: "mm" },
    { label: dictionary.product.height, value: product.height, unit: "mm" },
    { label: dictionary.product.depth, value: product.depth, unit: "mm" },
    {
      label: dictionary.product.netWeightShort,
      value: product.weight,
      unit: "gr",
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-xl font-bold text-text-main">
        <span className="h-6 w-1.5 rounded-full bg-primary" />
        {dictionary.product.dimensionsAndWeight}
      </h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {dimensions.map(
          (item) =>
            item.value && (
              <div
                key={item.label}
                className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
              >
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-text-muted">
                  {item.label}
                </p>
                <p className="text-lg font-black text-text-main">
                  {item.value}{" "}
                  <span className="text-sm font-normal text-text-muted">
                    {item.unit}
                  </span>
                </p>
              </div>
            ),
        )}
      </div>
    </div>
  );
}

function PackagingTable({ mode, product }: LogisticsProps) {
  const dictionary = useUiDictionary();

  if (!Array.isArray(product.packaging) || product.packaging.length === 0) {
    return null;
  }

  if (mode === "sidebar") {
    return (
      <div className="space-y-4 rounded-2xl border border-border bg-surface-muted p-6">
        <h4 className="flex items-center gap-2 text-md font-bold text-text-main">
          <PackageOpen className="h-4 w-4 text-primary" />
          {dictionary.product.logisticsInfo}
        </h4>
        <div className="space-y-3">
          {product.packaging.map((packaging: any, index: number) => (
            <div
              key={packaging.id || index}
              className="border-b border-border pb-3 text-sm last:border-0 last:pb-0"
            >
              <p className="mb-1 font-bold text-text-muted">
                {packaging.packageLabel}{" "}
                <span className="text-primary">
                  ({packaging.quantity} {dictionary.product.quantityUnit})
                </span>
              </p>
              <p className="text-xs text-text-muted">
                {dictionary.product.size}: {packaging.p_width}x
                {packaging.p_height}x{packaging.p_depth} cm
              </p>
              <p className="mt-0.5 text-xs text-text-muted">
                {dictionary.product.grossWeight}:{" "}
                <strong className="text-text-muted">
                  {packaging.grossWeight} kg
                </strong>
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-4">
      <h3 className="flex items-center gap-2 text-xl font-bold text-text-main">
        <span className="h-6 w-1.5 rounded-full bg-primary" />
        {dictionary.product.logisticsAndPackaging}
      </h3>
      <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="border-b border-border bg-surface-muted">
            <tr>
              <th className="px-6 py-4 font-bold text-text-main">
                {dictionary.product.packagingForm}
              </th>
              <th className="px-6 py-4 font-bold text-text-main">
                {dictionary.product.packageQuantity}
              </th>
              <th className="px-6 py-4 font-bold text-text-main">
                {dictionary.product.dimensionsCm}
              </th>
              <th className="px-6 py-4 font-bold text-text-main">
                {dictionary.product.grossWeight}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {product.packaging.map((packaging: any, index: number) => (
              <tr
                key={packaging.id || index}
                className="transition-colors hover:bg-surface-muted/50"
              >
                <td className="px-6 py-4 font-bold text-text-muted">
                  {packaging.packageLabel}
                </td>
                <td className="px-6 py-4 text-text-muted">
                  {packaging.quantity} {dictionary.product.quantityUnit}
                </td>
                <td className="px-6 py-4 font-mono text-text-muted">
                  {packaging.p_width}x{packaging.p_height}x{packaging.p_depth}
                </td>
                <td className="px-6 py-4 font-bold text-text-main">
                  {packaging.grossWeight} kg
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProductView({ product }: any) {
  const { addToCart } = useCart();
  const dictionary = useUiDictionary();
  const searchParams = useSearchParams();
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(
    () => getInitialSelectedAttributes(product),
  );
  const [manualCode, setManualCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifiedDoc, setVerifiedDoc] = useState<{
    url: string;
    label: string;
  } | null>(null);

  const activeTab = searchParams.get("tab") || "description";

  const currentVariant = useMemo(() => {
    if (!Array.isArray(product.variants) || product.variants.length === 0) {
      return null;
    }

    return product.variants.find((variant: any) =>
      Object.values(selectedAttrs).every((value) =>
        variant.title.includes(value),
      ),
    );
  }, [product.variants, selectedAttrs]);

  const hasCompleteVariantSelection = useMemo(() => {
    if (!Array.isArray(product.attributes) || product.attributes.length === 0) {
      return Boolean(currentVariant);
    }

    return product.attributes.every(
      (attribute: any) =>
        attribute?.name && Boolean(selectedAttrs[attribute.name]),
    );
  }, [currentVariant, product.attributes, selectedAttrs]);

  const mediaVariant = useMemo(() => {
    if (!hasCompleteVariantSelection || !currentVariant) return null;

    if (
      Array.isArray(currentVariant.variantImages) &&
      currentVariant.variantImages.length > 0
    ) {
      return currentVariant;
    }

    if (product.inheritVariantImagesFromPrevious === false) return null;

    const currentIndex = product.variants?.findIndex(
      (variant: any) =>
        variant.id === currentVariant.id || variant.sku === currentVariant.sku,
    );

    if (currentIndex === undefined || currentIndex <= 0) return null;

    for (let index = currentIndex - 1; index >= 0; index -= 1) {
      const previousVariant = product.variants[index];

      if (
        Array.isArray(previousVariant?.variantImages) &&
        previousVariant.variantImages.length > 0
      ) {
        return previousVariant;
      }
    }

    return null;
  }, [
    currentVariant,
    hasCompleteVariantSelection,
    product.inheritVariantImagesFromPrevious,
    product.variants,
  ]);

  const verifyDocument = useCallback(
    async (docLabel: string, code: string) => {
      if (!code.trim()) {
        setVerifyError(dictionary.product.accessCodeRequired);
        return;
      }

      setIsVerifying(true);
      setVerifyError(null);

      try {
        const response = await fetch("/api/verify-manual", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            code: code.trim(),
            docLabel,
          }),
        });
        const data = (await response.json()) as VerificationResponse;

        if (response.ok && data.success && data.fileUrl) {
          setVerifiedDoc({ url: data.fileUrl, label: docLabel });
          return;
        }

        setVerifyError(dictionary.product.invalidCode);
        window.setTimeout(() => setVerifyError(null), 5000);
      } catch {
        setVerifyError(dictionary.product.verificationUnavailable);
        window.setTimeout(() => setVerifyError(null), 5000);
      } finally {
        setIsVerifying(false);
      }
    },
    [dictionary.product, product.id],
  );

  const handleAddToCart = () => {
    addToCart({
      id: String(product.id),
      title: product.title,
      slug: product.slug,
      variant: currentVariant?.title || dictionary.product.defaultVariant,
      sku: currentVariant?.sku || product.sku,
      ...(currentVariant?.combinationKey
        ? { combinationKey: currentVariant.combinationKey }
        : {}),
      image:
        typeof mediaVariant?.variantImages?.[0]?.image === "object"
          ? mediaVariant.variantImages[0].image?.url
          : typeof product.mainImage === "object"
            ? product.mainImage?.url
            : "",
    });
  };

  const videoId = getYouTubeId(product.videoUrl || "");
  const logisticsPosition = product.logisticDisplayPosition || "below";

  const mainProductImages = useMemo(() => {
    if (typeof product.mainImage === "object" && product.mainImage?.url) {
      return [
        {
          url: product.mainImage.url,
          alt: product.mainImage.alt || product.title,
        },
      ];
    }

    return [];
  }, [product.mainImage, product.title]);

  const sharedProductImages = useMemo(() => {
    if (!Array.isArray(product.gallery)) return [];

    return product.gallery.flatMap((item: any) => {
      const image = item?.image;

      return typeof image === "object" && image?.url
        ? [{ url: image.url, alt: image.alt || product.title }]
        : [];
    });
  }, [product.gallery, product.title]);

  const variantImages = useMemo(() => {
    if (!Array.isArray(mediaVariant?.variantImages)) return [];

    return mediaVariant.variantImages.flatMap((item: any) => {
      const image = item?.image;

      return typeof image === "object" && image?.url
        ? [
            {
              url: image.url,
              alt:
                image.alt ||
                `${product.title} - ${currentVariant?.title || mediaVariant.title}`,
            },
          ]
        : [];
    });
  }, [currentVariant?.title, mediaVariant, product.title]);

  const displayedProductImages = useMemo(() => {
    const seenUrls = new Set<string>();
    const hasVariantMedia = variantImages.length > 0;
    const includeMainImage =
      !hasVariantMedia || product.hideMainImageWhenVariantSelected === false;
    const images = [
      ...variantImages,
      ...(includeMainImage ? mainProductImages : []),
      ...sharedProductImages,
    ];

    return images.filter((image) => {
      if (seenUrls.has(image.url)) return false;

      seenUrls.add(image.url);
      return true;
    });
  }, [
    mainProductImages,
    product.hideMainImageWhenVariantSelected,
    sharedProductImages,
    variantImages,
  ]);

  return (
    <div className="container relative mx-auto max-w-7xl px-4 pt-12">
      {verifiedDoc && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-surface-inverse/95 p-2 backdrop-blur-md sm:p-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col justify-between gap-4 rounded-t-3xl bg-surface p-4 shadow-2xl sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1">
              <h3 className="flex items-center gap-2 line-clamp-1 font-bold text-text-main">
                <FileText className="h-5 w-5 shrink-0 text-primary" />
                {verifiedDoc.label}
              </h3>
              <p className="flex items-center gap-1.5 text-[10px] italic text-text-muted md:text-xs">
                <Info className="h-3 w-3 text-text-muted" />
                {dictionary.product.saveDocumentHint}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
              <a
                href={verifiedDoc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-2xl bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary shadow-sm transition-all hover:bg-primary hover:text-primary-foreground"
              >
                <Download className="h-4 w-4" />
                {dictionary.product.downloadOrOpen}
              </a>
              <button
                type="button"
                onClick={() => setVerifiedDoc(null)}
                className="rounded-2xl bg-error/10 p-2.5 text-error transition-all hover:bg-error hover:text-error-foreground"
                title={dictionary.common.close}
                aria-label={dictionary.product.closeViewer}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-6xl flex-1 overflow-hidden rounded-b-3xl bg-surface-muted shadow-2xl">
            <iframe
              src={`${verifiedDoc.url}#toolbar=0`}
              className="h-full w-full border-none"
              title={verifiedDoc.label}
            />
          </div>
        </div>
      )}

      <AnimatePresence>
        {verifyError && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[110] flex min-w-[300px] items-center gap-3 rounded-2xl border-l-4 border-l-error bg-surface p-4 shadow-2xl"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-text-main">
                {dictionary.product.accessDenied}
              </p>
              <p className="text-xs text-text-muted">{verifyError}</p>
            </div>
            <button
              type="button"
              onClick={() => setVerifyError(null)}
              className="p-1 text-text-muted hover:text-text-main"
              aria-label={dictionary.product.closeError}
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-20 grid grid-cols-1 gap-16 lg:grid-cols-2">
        <ProductGallery
          key={
            hasCompleteVariantSelection && currentVariant
              ? currentVariant.sku
              : "default"
          }
          images={displayedProductImages}
          productTitle={
            variantImages.length > 0
              ? `${product.title} - ${currentVariant?.title}`
              : product.title
          }
        />

        <div className="flex flex-col space-y-8">
          <div>
            <h1 className="mb-4 text-3xl font-black text-text-main md:text-4xl">
              {product.title}
            </h1>
            <div className="flex items-center gap-4">
              <span className="rounded-full border border-border/70 bg-surface-muted px-3 py-1 font-mono text-xs font-bold text-text-muted">
                SKU: {currentVariant?.sku || product.sku || dictionary.common.notSpecified}
              </span>
              {product.isOriginalErtipProduct !== false && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                  <Award className="h-4 w-4" />
                  {dictionary.product.originalErtipProduct}
                </span>
              )}
            </div>
          </div>

          {product.shortDescription && (
            <p className="leading-relaxed text-text-muted">
              {product.shortDescription}
            </p>
          )}

          {Array.isArray(product.attributes) && product.attributes.length > 0 && (
            <div className="space-y-6 pt-4">
              {product.attributes.map((attribute: any, index: number) => {
                const values = String(attribute.values || "")
                  .split("-")
                  .map((value) => value.trim())
                  .filter(Boolean);

                return (
                  <div key={attribute.id || index} className="space-y-3">
                    <p className="text-sm font-bold uppercase tracking-wider text-text-main">
                      {attribute.name} {dictionary.product.selectionSuffix}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {values.map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setSelectedAttrs((previousAttributes) => ({
                              ...previousAttributes,
                              [attribute.name]: value,
                            }))
                          }
                          className={`rounded-[var(--radius)] border px-5 py-2.5 text-sm font-bold transition-all ${
                            selectedAttrs[attribute.name] === value
                              ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                              : "border-border bg-surface text-text-muted hover:border-primary hover:bg-primary/5 hover:text-primary"
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-col gap-4 pt-8 sm:flex-row">
            <Button
              size="lg"
              className="h-16 flex-1 rounded-[var(--radius-xl)] px-10 text-lg font-bold"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-6 w-6" />
              {dictionary.product.addToQuoteCart}
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="mb-12 h-auto w-full flex-wrap justify-start gap-y-4 rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="description"
            className="rounded-none border-b-2 border-transparent px-6 py-4 text-base font-bold data-[state=active]:border-primary data-[state=active]:bg-transparent md:px-8 md:text-lg"
          >
            {dictionary.product.descriptionTab}
          </TabsTrigger>

          {Array.isArray(product.variants) && product.variants.length > 0 && (
            <TabsTrigger
              value="variants"
              className="rounded-none border-b-2 border-transparent px-6 py-4 text-base font-bold data-[state=active]:border-primary data-[state=active]:bg-transparent md:px-8 md:text-lg"
            >
              {dictionary.product.variantsTab}
            </TabsTrigger>
          )}

          {videoId && (
            <TabsTrigger
              value="video"
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent px-6 py-4 text-base font-bold data-[state=active]:border-primary data-[state=active]:bg-transparent md:px-8 md:text-lg"
            >
              <PlayCircle className="h-5 w-5" />
              {dictionary.product.videoTab}
            </TabsTrigger>
          )}

          {((Array.isArray(product.publicDocs) && product.publicDocs.length > 0) ||
            (Array.isArray(product.protectedDocs) &&
              product.protectedDocs.length > 0)) && (
            <TabsTrigger
              value="docs"
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent px-6 py-4 text-base font-bold data-[state=active]:border-primary data-[state=active]:bg-transparent md:px-8 md:text-lg"
            >
              <FileText className="h-5 w-5" />
              {dictionary.product.documentsTab}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="description" className="max-w-none">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-3">
            <div className="space-y-8 leading-relaxed text-text-muted lg:col-span-2">
              {product.description ? (
                <div className="prose prose-lg max-w-none prose-headings:text-text-main prose-p:text-text-muted prose-a:text-primary prose-strong:text-text-main prose-blockquote:border-primary prose-blockquote:text-text-main prose-li:text-text-muted prose-img:rounded-2xl prose-img:border prose-img:border-border prose-table:w-full prose-table:border-collapse prose-th:bg-surface-muted prose-th:p-4 prose-th:text-text-main prose-td:border-b prose-td:border-border prose-td:p-4 prose-td:text-text-muted prose-code:rounded-lg prose-code:bg-surface-muted prose-code:px-2.5 prose-code:py-1 prose-code:font-mono prose-code:text-sm prose-code:font-bold prose-code:text-text-muted prose-code:before:hidden prose-code:after:hidden hover:prose-a:text-primary/80">
                  {typeof product.description === "string" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    >
                      {product.description}
                    </ReactMarkdown>
                  ) : (
                    <div className="rounded-xl border border-warning/25 bg-warning/10 p-4 text-warning">
                      {dictionary.product.legacyDescriptionWarning}
                    </div>
                  )}
                </div>
              ) : (
                <p className="italic text-text-muted">
                  {dictionary.product.noDescription}
                </p>
              )}

              {(logisticsPosition === "below" ||
                logisticsPosition === "both") && (
                <div className="mt-16 space-y-12 border-t border-border pt-10">
                  <NetDimensions mode="wide" product={product} />
                  <PackagingTable mode="wide" product={product} />
                </div>
              )}
            </div>

            <div className="sticky top-24 space-y-6">
              {Array.isArray(product.specs) && product.specs.length > 0 && (
                <div className="space-y-6 rounded-2xl border border-border bg-surface-muted p-8">
                  <h4 className="flex items-center gap-2 text-lg font-bold">
                    <Info className="h-5 w-5 text-primary" />
                    {dictionary.product.keyFeatures}
                  </h4>
                  <ul className="space-y-4 text-sm">
                    {product.specs.map((spec: any, index: number) => (
                      <li
                        key={spec.id || index}
                        className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                      >
                        <span className="text-text-muted">{spec.key}:</span>
                        <strong className="max-w-[60%] text-right text-text-main">
                          {spec.value}
                        </strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(logisticsPosition === "sidebar" ||
                logisticsPosition === "both") && (
                <>
                  <NetDimensions mode="sidebar" product={product} />
                  <PackagingTable mode="sidebar" product={product} />
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {Array.isArray(product.variants) && product.variants.length > 0 && (
          <TabsContent value="variants">
            <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
              <table className="w-full min-w-[600px] border-collapse text-left">
                <thead className="border-b border-border bg-surface-muted">
                  <tr>
                    <th className="px-6 py-4 font-bold text-text-main">
                      {dictionary.product.variantModel}
                    </th>
                    <th className="px-6 py-4 font-bold text-text-main">
                      {dictionary.product.skuCode}
                    </th>
                    <th className="px-6 py-4 font-bold text-text-main">
                      {dictionary.product.status}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {product.variants.map((variant: any, index: number) => (
                    <tr
                      key={variant.id || index}
                      className={`transition-colors hover:bg-surface-muted/50 ${
                        currentVariant?.sku === variant.sku ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-text-muted">
                        {variant.title}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm font-bold text-primary">
                        {variant.sku}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {variant.isActive === false ? (
                          <span className="font-bold text-text-muted">
                            {dictionary.product.inactive}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-bold text-success">
                            <Check className="h-4 w-4" />
                            {dictionary.product.inStock}
                          </span>
                        )}
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
            <div className="mx-auto max-w-4xl">
              <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-surface-inverse shadow-xl">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                  title={`${product.title} ${dictionary.product.promoVideoSuffix}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </div>
          </TabsContent>
        )}

        <TabsContent value="docs" className="pt-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-bold italic text-text-main">
                <Info className="h-5 w-5 text-primary" />
                {dictionary.product.promotionalMaterials}
              </h3>
              {product.publicDocs?.map((document: any, index: number) => {
                const fileUrl =
                  typeof document.file === "object" ? document.file?.url : null;

                if (!fileUrl) return null;

                return (
                  <a
                    key={document.id || index}
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-2xl border border-border bg-surface-muted p-4 transition-all hover:border-primary"
                  >
                    <span className="font-medium text-text-muted">
                      {document.label}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="group-hover:text-primary"
                    >
                      {dictionary.common.download}
                    </Button>
                  </a>
                );
              })}
            </div>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-bold italic text-text-main">
                <Award className="h-5 w-5 text-primary" />
                {dictionary.product.technicalDocumentation}
              </h3>
              {product.protectedDocs?.map((document: any, index: number) => (
                <div
                  key={document.id || index}
                  className="rounded-2xl border-2 border-dashed border-border bg-surface p-4"
                >
                  <p className="mb-3 font-bold text-text-main">
                    {document.label}
                  </p>
                  <div className="relative flex gap-2">
                    <input
                      type="text"
                      value={manualCode}
                      placeholder={dictionary.product.accessCodePlaceholder}
                      className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-text-main outline-none placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-ring"
                      onChange={(event) => setManualCode(event.target.value)}
                    />
                    <Button
                      size="sm"
                      onClick={() =>
                        void verifyDocument(document.label, manualCode)
                      }
                      disabled={isVerifying || !manualCode.trim()}
                    >
                      {isVerifying ? "..." : dictionary.product.access}
                    </Button>
                  </div>
                  <p className="mt-2 text-[10px] italic text-text-muted">
                    {dictionary.product.accessLogged}
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
