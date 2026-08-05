"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import {
  SectionShell,
  type SectionOptions,
} from "@/components/blocks/SectionShell";
import { getGalleryBlockDictionary } from "@/lib/i18n/galleryBlockDictionary";
import { useSiteLocale } from "@/providers/SiteLocaleProvider";

type GalleryLayout = "mosaic" | "grid" | "masonry" | "featured";
type ImageRatio = "auto" | "landscape" | "wide" | "square" | "portrait";

type GalleryImage = {
  image?: {
    url?: string | null;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
  } | number | null;
  title?: string | null;
  description?: string | null;
};

type PreparedImage = {
  url: string;
  alt: string;
  width: number;
  height: number;
  title?: string | null;
  description?: string | null;
};

const imageRatioClasses: Record<ImageRatio, string> = {
  auto: "h-auto",
  landscape: "aspect-[4/3] h-full",
  wide: "aspect-video h-full",
  square: "aspect-square h-full",
  portrait: "aspect-[3/4] h-full",
};

function prepareImages(images: GalleryImage[] | null | undefined, fallbackAlt: string) {
  if (!images) return [];

  return images.reduce<PreparedImage[]>((acc, item) => {
    if (typeof item.image === "object" && item.image?.url) {
      acc.push({
        url: item.image.url,
        alt: item.image.alt || item.title || fallbackAlt,
        width: item.image.width || 1200,
        height: item.image.height || 900,
        title: item.title,
        description: item.description,
      });
    }
    return acc;
  }, []);
}

function GalleryItem({
  image,
  index,
  onSelect,
  className,
  imageClassName,
  priority = false,
  enableLightbox,
  showCaptions,
  enlargeSuffix,
}: {
  image: PreparedImage;
  index: number;
  onSelect: (index: number, trigger: HTMLElement) => void;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  enableLightbox: boolean;
  showCaptions: boolean;
  enlargeSuffix: string;
}) {
  const hasCaption = showCaptions && (image.title || image.description);

  const content = (
    <>
      <div className="relative overflow-hidden">
        {enableLightbox && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            <span className="flex h-12 w-12 scale-75 items-center justify-center rounded-full bg-surface text-primary shadow-xl transition-transform duration-300 group-hover:scale-100 group-focus-visible:scale-100">
              <Maximize2 className="h-6 w-6" />
            </span>
          </div>
        )}

        <Image
          src={image.url}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className={cn(
            "w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]",
            imageClassName,
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          quality={78}
          priority={priority}
        />
      </div>

      {hasCaption && (
        <div className="space-y-1.5 border-t border-border bg-surface px-5 py-4">
          {image.title && (
            <h3 className="font-bold text-text-main">{image.title}</h3>
          )}
          {image.description && (
            <p className="text-sm leading-6 text-text-muted">
              {image.description}
            </p>
          )}
        </div>
      )}
    </>
  );

  const sharedClassName = cn(
    "group block w-full overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-surface-inverse/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4",
    className,
  );

  if (!enableLightbox) {
    return <div className={sharedClassName}>{content}</div>;
  }

  return (
    <button
      type="button"
      className={sharedClassName}
      onClick={(event) => onSelect(index, event.currentTarget)}
      aria-label={`${image.title || image.alt} ${enlargeSuffix}`}
    >
      {content}
    </button>
  );
}

function GalleryGrid({
  images,
  onSelect,
  layout,
  imageRatio,
  enableLightbox,
  showCaptions,
  enlargeSuffix,
}: {
  images: PreparedImage[];
  onSelect: (index: number, trigger: HTMLElement) => void;
  layout: GalleryLayout;
  imageRatio: ImageRatio;
  enableLightbox: boolean;
  showCaptions: boolean;
  enlargeSuffix: string;
}) {
  const ratioClass = imageRatioClasses[imageRatio];

  if (layout === "featured") {
    const [firstImage, ...restImages] = images;

    if (restImages.length === 0 && firstImage) {
      return (
        <div className="mx-auto max-w-5xl">
          <GalleryItem
            image={firstImage}
            index={0}
            onSelect={onSelect}
            imageClassName="aspect-video min-h-[320px] object-cover md:min-h-[480px]"
            priority
            enableLightbox={enableLightbox}
            showCaptions={showCaptions}
            enlargeSuffix={enlargeSuffix}
          />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        {firstImage && (
          <GalleryItem
            image={firstImage}
            index={0}
            onSelect={onSelect}
            imageClassName="aspect-[4/3] min-h-[360px] object-cover lg:h-full"
            priority
            enableLightbox={enableLightbox}
            showCaptions={showCaptions}
            enlargeSuffix={enlargeSuffix}
          />
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
          {restImages.map((image, index) => (
            <GalleryItem
              key={`${image.url}-${index}`}
              image={image}
              index={index + 1}
              onSelect={onSelect}
              imageClassName={ratioClass}
              priority={index < 2}
              enableLightbox={enableLightbox}
              showCaptions={showCaptions}
              enlargeSuffix={enlargeSuffix}
            />
          ))}
        </div>
      </div>
    );
  }

  if (layout === "grid") {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <GalleryItem
            key={`${image.url}-${index}`}
            image={image}
            index={index}
            onSelect={onSelect}
            imageClassName={ratioClass}
            priority={index < 3}
            enableLightbox={enableLightbox}
            showCaptions={showCaptions}
            enlargeSuffix={enlargeSuffix}
          />
        ))}
      </div>
    );
  }

  if (layout === "mosaic") {
    return (
      <div className="grid auto-rows-[220px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {images.map((image, index) => {
          const spanClass =
            index === 0
              ? "md:col-span-2 md:row-span-2"
              : index > 0 && index % 7 === 0
                ? "lg:col-span-2"
                : "";

          return (
            <GalleryItem
              key={`${image.url}-${index}`}
              image={image}
              index={index}
              onSelect={onSelect}
              className={spanClass}
              imageClassName="h-full min-h-[220px]"
              priority={index < 3}
              enableLightbox={enableLightbox}
              showCaptions={showCaptions}
              enlargeSuffix={enlargeSuffix}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3">
      {images.map((image, index) => (
        <GalleryItem
          key={`${image.url}-${index}`}
          image={image}
          index={index}
          onSelect={onSelect}
          className="mb-6 break-inside-avoid"
          imageClassName="h-auto"
          priority={index < 3}
          enableLightbox={enableLightbox}
          showCaptions={showCaptions}
          enlargeSuffix={enlargeSuffix}
        />
      ))}
    </div>
  );
}

export function GalleryBlock({
  eyebrow,
  title,
  subtitle,
  images,
  galleryLayout = "mosaic",
  imageRatio = "landscape",
  alignment = "left",
  enableLightbox = true,
  showCaptions = true,
  section,
}: {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  images?: GalleryImage[] | null;
  galleryLayout?: GalleryLayout | null;
  imageRatio?: ImageRatio | null;
  alignment?: "left" | "center" | null;
  enableLightbox?: boolean | null;
  showCaptions?: boolean | null;
  section?: SectionOptions | null;
}) {
  const locale = useSiteLocale();
  const dictionary = getGalleryBlockDictionary(locale);
  const preparedImages = useMemo(
    () => prepareImages(images, dictionary.imageFallback),
    [dictionary.imageFallback, images],
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const resolvedLayout = galleryLayout || "mosaic";
  const resolvedRatio = imageRatio || "landscape";
  const lightboxEnabled = enableLightbox !== false;
  const captionsEnabled = showCaptions !== false;
  const background = section?.background || "muted";
  const inverse = background === "primary" || background === "dark";

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const showPrevious = useCallback(() => {
    setSelectedIndex((current) => {
      if (current === null || preparedImages.length === 0) return current;
      return (current - 1 + preparedImages.length) % preparedImages.length;
    });
  }, [preparedImages.length]);

  const showNext = useCallback(() => {
    setSelectedIndex((current) => {
      if (current === null || preparedImages.length === 0) return current;
      return (current + 1) % preparedImages.length;
    });
  }, [preparedImages.length]);

  const openLightbox = useCallback((index: number, trigger: HTMLElement) => {
    lastFocusedRef.current = trigger;
    setSelectedIndex(index);
  }, []);

  useEffect(() => {
    if (selectedIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) return;

      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      lastFocusedRef.current?.focus();
    };
  }, [closeLightbox, selectedIndex, showNext, showPrevious]);

  if (preparedImages.length === 0) return null;

  const currentImage =
    selectedIndex === null ? null : preparedImages[selectedIndex] || null;

  return (
    <SectionShell
      section={section}
      defaultBackground="muted"
      defaultSpacing="large"
      defaultContentWidth="wide"
    >
      <div className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          alignment={alignment || "left"}
          inverse={inverse}
          className={cn(alignment === "center" && "md:mx-auto")}
        />

        {lightboxEnabled && alignment !== "center" && (
          <p className="shrink-0 text-sm font-medium text-current opacity-65">
            {dictionary.selectToEnlarge}
          </p>
        )}
      </div>

      <GalleryGrid
        images={preparedImages}
        onSelect={openLightbox}
        layout={resolvedLayout}
        imageRatio={resolvedRatio}
        enableLightbox={lightboxEnabled}
        showCaptions={captionsEnabled}
        enlargeSuffix={dictionary.enlargeSuffix}
      />

      {currentImage && selectedIndex !== null && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label={dictionary.viewer}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-inverse/95 p-4 text-surface-inverse-foreground backdrop-blur-md md:p-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeLightbox();
          }}
          onTouchStart={(event) => {
            touchStartXRef.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            const start = touchStartXRef.current;
            const end = event.changedTouches[0]?.clientX;
            touchStartXRef.current = null;
            if (start === null || end === undefined) return;

            const distance = end - start;
            if (Math.abs(distance) < 50) return;
            if (distance > 0) showPrevious();
            else showNext();
          }}
        >
          <button
            ref={closeButtonRef}
            type="button"
            className="absolute right-4 top-4 z-[103] flex h-12 w-12 items-center justify-center rounded-full bg-background/10 text-current transition-colors hover:bg-background/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current md:right-8 md:top-8"
            onClick={closeLightbox}
            aria-label={dictionary.close}
          >
            <X className="h-7 w-7" />
          </button>

          {preparedImages.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-3 top-1/2 z-[102] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-background/10 text-current transition-colors hover:bg-background/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current md:left-8 md:h-14 md:w-14"
                onClick={showPrevious}
                aria-label={dictionary.previous}
              >
                <ChevronLeft className="h-7 w-7" />
              </button>

              <button
                type="button"
                className="absolute right-3 top-1/2 z-[102] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-background/10 text-current transition-colors hover:bg-background/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current md:right-8 md:h-14 md:w-14"
                onClick={showNext}
                aria-label={dictionary.next}
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          <div className="flex max-h-[92vh] w-full max-w-6xl flex-col items-center justify-center gap-4 px-10 md:px-20">
            <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
              <Image
                key={currentImage.url}
                src={currentImage.url}
                alt={currentImage.alt}
                width={currentImage.width}
                height={currentImage.height}
                className="h-auto max-h-[72vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
                sizes="100vw"
                quality={88}
                priority
              />
            </div>

            <div className="w-full max-w-3xl text-center" aria-live="polite">
              <div className="text-xs font-bold uppercase tracking-[0.18em] opacity-60">
                {selectedIndex + 1} / {preparedImages.length}
              </div>
              {currentImage.title && (
                <h3 className="mt-2 text-xl font-bold md:text-2xl">
                  {currentImage.title}
                </h3>
              )}
              {currentImage.description && (
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 opacity-75 md:text-base">
                  {currentImage.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </SectionShell>
  );
}
