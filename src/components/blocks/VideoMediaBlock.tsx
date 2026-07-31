import Link from "next/link";
import { ArrowRight, Video } from "lucide-react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import {
  SectionShell,
  type SectionOptions,
} from "@/components/blocks/SectionShell";

type MediaValue =
  | number
  | string
  | {
      url?: string | null;
      alt?: string | null;
      mimeType?: string | null;
    }
  | null;

type VideoMediaBlockProps = {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  content?: Parameters<typeof RichText>[0]["data"] | null;
  sourceType?: "external" | "upload" | null;
  layoutMode?: "full" | "split" | null;
  mediaPosition?: "left" | "right" | null;
  externalUrl?: string | null;
  videoFile?: MediaValue;
  poster?: MediaValue;
  aspectRatio?: "16:9" | "4:3" | "1:1" | "9:16" | null;
  frameStyle?: "elevated" | "outlined" | "plain" | null;
  alignment?: "left" | "center" | null;
  controls?: boolean | null;
  autoplay?: boolean | null;
  loop?: boolean | null;
  muted?: boolean | null;
  caption?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  section?: SectionOptions | null;
};

function getMedia(value: MediaValue) {
  return typeof value === "object" && value?.url ? value : null;
}

function getExternalEmbedUrl(
  rawUrl: string,
  options: { autoplay: boolean; muted: boolean; loop: boolean; controls: boolean },
) {
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be" || hostname.endsWith("youtube.com")) {
      const id = hostname === "youtu.be"
        ? url.pathname.split("/").filter(Boolean)[0]
        : url.searchParams.get("v") ||
          url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1];
      if (!id) return null;

      const params = new URLSearchParams({
        autoplay: options.autoplay ? "1" : "0",
        mute: options.autoplay || options.muted ? "1" : "0",
        controls: options.controls ? "1" : "0",
        rel: "0",
        playsinline: "1",
      });
      if (options.loop) {
        params.set("loop", "1");
        params.set("playlist", id);
      }
      return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${params.toString()}`;
    }

    if (hostname === "vimeo.com" || hostname.endsWith("player.vimeo.com")) {
      const id = url.pathname.split("/").filter(Boolean).find((part) => /^\d+$/.test(part));
      if (!id) return null;
      const params = new URLSearchParams({
        autoplay: options.autoplay ? "1" : "0",
        muted: options.autoplay || options.muted ? "1" : "0",
        loop: options.loop ? "1" : "0",
        controls: options.controls ? "1" : "0",
        dnt: "1",
      });
      return `https://player.vimeo.com/video/${id}?${params.toString()}`;
    }
  } catch {
    return null;
  }

  return null;
}

const ratioClasses = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "9:16": "aspect-[9/16] max-w-md mx-auto",
} as const;

export function VideoMediaBlock({
  eyebrow,
  title,
  subtitle,
  content,
  sourceType = "external",
  layoutMode = "full",
  mediaPosition = "left",
  externalUrl,
  videoFile,
  poster,
  aspectRatio = "16:9",
  frameStyle = "elevated",
  alignment = "center",
  controls = true,
  autoplay = false,
  loop = false,
  muted = false,
  caption,
  buttonText,
  buttonLink,
  section,
}: VideoMediaBlockProps) {
  const video = getMedia(videoFile);
  const posterMedia = getMedia(poster);
  const resolvedSource = sourceType || "external";
  const resolvedLayout = layoutMode || "full";
  const resolvedPosition = mediaPosition || "left";
  const resolvedRatio = aspectRatio || "16:9";
  const resolvedFrame = frameStyle || "elevated";
  const embedUrl = externalUrl
    ? getExternalEmbedUrl(externalUrl, {
        autoplay: Boolean(autoplay),
        muted: Boolean(muted),
        loop: Boolean(loop),
        controls: controls !== false,
      })
    : null;
  const hasPlayableMedia = resolvedSource === "upload" ? Boolean(video?.url) : Boolean(embedUrl);
  const inverse = section?.background === "dark" || section?.background === "primary";
  const hasText = Boolean(eyebrow || title || subtitle || content || (buttonText && buttonLink));

  if (!hasPlayableMedia && !hasText) return null;

  const mediaElement = (
    <figure>
      <div
        className={cn(
          "relative overflow-hidden rounded-[var(--radius-2xl)] bg-surface-inverse",
          ratioClasses[resolvedRatio],
          resolvedFrame === "elevated" && "border border-border/50 shadow-2xl shadow-surface-inverse/15",
          resolvedFrame === "outlined" && "border border-border",
        )}
      >
        {resolvedSource === "external" && embedUrl ? (
          <iframe
            src={embedUrl}
            title={title || caption || "Ertip Medikal video içeriği"}
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : resolvedSource === "upload" && video?.url ? (
          <video
            className="absolute inset-0 h-full w-full object-contain"
            src={video.url}
            poster={posterMedia?.url || undefined}
            controls={controls !== false}
            autoPlay={Boolean(autoplay)}
            muted={Boolean(autoplay || muted)}
            loop={Boolean(loop)}
            playsInline
            preload="metadata"
            aria-label={video.alt || title || "Ertip Medikal video içeriği"}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-surface-muted text-text-muted">
            <Video className="h-12 w-12" />
            <p className="px-6 text-center font-semibold">
              Geçerli bir YouTube/Vimeo bağlantısı veya video dosyası seçin.
            </p>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-4 text-center text-sm leading-6 text-current opacity-60">
          {caption}
        </figcaption>
      )}
    </figure>
  );

  const textElement = hasText ? (
    <div>
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        alignment={resolvedLayout === "split" ? "left" : alignment}
        inverse={inverse}
        className={resolvedLayout === "full" ? "mb-10" : undefined}
      />
      {content && (
        <div className="mt-7 space-y-5 text-base leading-8 text-current opacity-75 [&_a]:font-semibold [&_a]:text-primary [&_h2]:text-2xl [&_h2]:font-black [&_h3]:text-xl [&_h3]:font-bold [&_li]:mb-2 [&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc">
          <RichText data={content} />
        </div>
      )}
      {buttonText && buttonLink && (
        <Button asChild size="lg" className="mt-8 rounded-[var(--radius-xl)] font-bold">
          <Link href={buttonLink}>
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  ) : null;

  return (
    <SectionShell
      section={section}
      defaultBackground="light"
      defaultSpacing="large"
      defaultContentWidth="wide"
    >
      {resolvedLayout === "split" ? (
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className={cn(resolvedPosition === "right" && "lg:order-2")}>{mediaElement}</div>
          <div className={cn(resolvedPosition === "right" && "lg:order-1")}>{textElement}</div>
        </div>
      ) : (
        <div>
          {textElement}
          {mediaElement}
        </div>
      )}
    </SectionShell>
  );
}
