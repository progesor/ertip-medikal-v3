import Link from "next/link";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import {
  ExternalLink,
  Mail,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";

type FloatingActionType = "whatsapp" | "phone" | "email" | "custom";
type FloatingActionPosition = "bottom-right" | "bottom-left";
type FloatingActionStyleMode = "theme" | "whatsapp";
type FloatingActionAppearance = "pill" | "chat-bubble" | "icon-only";

function normalizeCustomUrl(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  try {
    const parsed = new URL(value);

    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    return "";
  }

  return "";
}

function buildFloatingActionHref(settings: any) {
  const type = (settings?.type || "whatsapp") as FloatingActionType;
  const phoneNumber = String(settings?.phoneNumber || "").replace(/\D/g, "");
  const message = String(settings?.message || "");
  const email = String(settings?.email || "").trim();
  const customUrl = String(settings?.customUrl || "").trim();

  if (type === "whatsapp") {
    if (!phoneNumber) return "";

    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${phoneNumber}${
      encodedMessage ? `?text=${encodedMessage}` : ""
    }`;
  }

  if (type === "phone") {
    return phoneNumber ? `tel:+${phoneNumber}` : "";
  }

  if (type === "email") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? `mailto:${email}`
      : "";
  }

  if (type === "custom") {
    return normalizeCustomUrl(customUrl);
  }

  return "";
}

function getFloatingActionIcon(
  type: FloatingActionType,
  isWhatsappStyle: boolean,
) {
  if (type === "whatsapp") {
    return (
      <span className="relative flex h-5 w-5 items-center justify-center">
        <MessageCircle className="h-5 w-5" />
        {isWhatsappStyle && (
          <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
        )}
      </span>
    );
  }

  if (type === "phone") return <Phone className="h-5 w-5" />;
  if (type === "email") return <Mail className="h-5 w-5" />;

  return <ExternalLink className="h-5 w-5" />;
}

function getDefaultLabel(type: FloatingActionType) {
  if (type === "whatsapp") return "WhatsApp ile İletişim";
  if (type === "phone") return "Hemen Ara";
  if (type === "email") return "E-posta Gönder";

  return "İletişime Geç";
}

function isExternalHref(href: string) {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

export async function FloatingActionButton() {
  const payload = await getPayload({ config: configPromise });
  const siteSettings = await payload.findGlobal({
    slug: "site-settings",
    depth: 1,
  });
  const floatingAction = (siteSettings as any)?.floatingAction || {};

  if (floatingAction.enabled !== true) {
    return null;
  }

  const type = (floatingAction.type || "whatsapp") as FloatingActionType;
  const position = (floatingAction.position ||
    "bottom-right") as FloatingActionPosition;
  const styleMode = (floatingAction.styleMode ||
    "whatsapp") as FloatingActionStyleMode;
  const appearance = (floatingAction.appearance ||
    "pill") as FloatingActionAppearance;
  const showIcon = floatingAction.showIcon !== false;
  const showMotion = floatingAction.showPulse !== false;
  const showHelperText = floatingAction.showHelperText === true;
  const href = buildFloatingActionHref(floatingAction);

  if (!href) {
    return null;
  }

  const isWhatsapp = type === "whatsapp";
  const isWhatsappStyle = isWhatsapp && styleMode === "whatsapp";
  const label = floatingAction.label || getDefaultLabel(type);
  const helperText =
    floatingAction.helperText || "Size nasıl yardımcı olabiliriz?";
  const openInNewTab = floatingAction.openInNewTab !== false;
  const positionClass =
    position === "bottom-left" ? "left-4 sm:left-6" : "right-4 sm:right-6";
  const alignClass =
    position === "bottom-left"
      ? "items-start text-left"
      : "items-end text-right";
  const targetProps =
    openInNewTab || isExternalHref(href)
      ? {
          target: "_blank",
          rel: "noopener noreferrer",
        }
      : {};
  const colorClass = isWhatsappStyle
    ? "border-[#25D366]/80 bg-[#25D366] text-white shadow-[0_18px_38px_-18px_rgba(37,211,102,0.9)] hover:bg-[#1ebe5b] focus:ring-[#25D366]/30"
    : "border-primary/20 bg-primary text-primary-foreground shadow-[0_18px_38px_-18px_hsl(var(--primary)/0.85)] hover:bg-primary/90 focus:ring-ring/30";
  const iconSurfaceClass = isWhatsappStyle
    ? "bg-white/16 text-white"
    : "bg-primary-foreground/15 text-primary-foreground";
  const shapeClass =
    appearance === "chat-bubble"
      ? "rounded-[var(--radius-2xl)]"
      : "rounded-full";
  const sizeClass =
    appearance === "icon-only"
      ? "h-[3.75rem] w-[3.75rem] justify-center p-0 sm:h-16 sm:w-16"
      : "gap-2.5 px-4 py-3 sm:px-5";
  const motionClass = showMotion
    ? "motion-safe:animate-[floating-action-nudge_2s_ease-in-out_infinite]"
    : "";

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes floating-action-nudge {
              0%, 88%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
              90% { transform: translate3d(-1px, 0, 0) rotate(-1deg); }
              92% { transform: translate3d(2px, 0, 0) rotate(1.5deg); }
              94% { transform: translate3d(-2px, 0, 0) rotate(-1.5deg); }
              96% { transform: translate3d(1px, 0, 0) rotate(1deg); }
              98% { transform: translate3d(0, 0, 0) rotate(0deg); }
            }
          `,
        }}
      />

      <div
        className={`fixed bottom-5 ${positionClass} z-50 flex flex-col ${alignClass} gap-2`}
      >
        {showHelperText && (
          <div
            className={`max-w-[260px] rounded-[var(--radius-xl)] border border-border bg-surface/95 px-4 py-2.5 text-xs font-semibold text-text-muted shadow-xl shadow-surface-inverse/10 backdrop-blur-md ${
              position === "bottom-left" ? "ml-1" : "mr-1"
            }`}
          >
            <span className="block text-text-main">{helperText}</span>
            {isWhatsapp && (
              <span className="mt-0.5 block text-[11px] font-medium text-text-muted">
                WhatsApp üzerinden hızlı dönüş alın.
              </span>
            )}
          </div>
        )}

        <Link
          href={href}
          {...targetProps}
          aria-label={label}
          className={`relative inline-flex items-center overflow-visible border text-sm font-extrabold tracking-tight transition duration-300 hover:-translate-y-1 focus:outline-none focus:ring-4 ${shapeClass} ${sizeClass} ${colorClass} ${motionClass}`}
        >
          {appearance === "chat-bubble" && (
            <span
              className={`absolute bottom-1 h-3 w-3 rotate-45 rounded-[3px] ${
                position === "bottom-left" ? "left-5" : "right-5"
              } ${isWhatsappStyle ? "bg-[#25D366]" : "bg-primary"}`}
              aria-hidden="true"
            />
          )}

          {showIcon && (
            <span
              className={
                appearance === "icon-only"
                  ? "relative z-10 flex items-center justify-center"
                  : `relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconSurfaceClass}`
              }
            >
              {getFloatingActionIcon(type, isWhatsappStyle)}
            </span>
          )}

          {appearance !== "icon-only" && (
            <span className="relative z-10 flex flex-col leading-tight">
              <span>{label}</span>
              {isWhatsapp && appearance === "chat-bubble" && (
                <span className="mt-0.5 hidden text-[10px] font-semibold opacity-80 sm:inline">
                  Mesaj göndermek için tıklayın
                </span>
              )}
            </span>
          )}

          {appearance !== "icon-only" && isWhatsapp && (
            <Send className="relative z-10 hidden h-4 w-4 opacity-80 sm:block" />
          )}
          {appearance === "icon-only" && (
            <span className="sr-only">{label}</span>
          )}
        </Link>
      </div>
    </>
  );
}
