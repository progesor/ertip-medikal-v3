import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { getRequestLocale } from "@/lib/i18n/requestLocale";

type LocationLayoutMode = "auto" | "single-column" | "two-column" | "grid";

type LocationItem = {
  title?: string;
  address?: string;
  phone?: string;
  email?: string;
  workingHours?: string;
  mapUrl?: string;
};

type LocationBlockProps = {
  title?: string;
  layoutMode?: LocationLayoutMode;
  locations?: LocationItem[];
};

type LocationLabels = {
  fallbackTitle: string;
  mapSuffix: string;
  mapUnavailable: string;
  primaryLocation: string;
  openMap: string;
};

function readText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function createPhoneHref(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : undefined;
}

function createMapHref(location: LocationItem) {
  const query = readText(location.address) || readText(location.title);

  if (query) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  return readText(location.mapUrl);
}

function MapFrame({
  location,
  labels,
  className = "",
}: {
  location: LocationItem;
  labels: LocationLabels;
  className?: string;
}) {
  return (
    <div
      className={`relative min-h-64 w-full overflow-hidden bg-surface-muted ${className}`}
    >
      {location.mapUrl ? (
        <iframe
          src={location.mapUrl}
          title={`${location.title || labels.fallbackTitle} ${labels.mapSuffix}`}
          className="h-full min-h-64 w-full border-none"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center text-text-muted">
          <MapPin className="h-8 w-8 text-primary" />
          <span className="text-sm font-semibold">{labels.mapUnavailable}</span>
        </div>
      )}
    </div>
  );
}

function ContactRows({
  location,
  compact = false,
}: {
  location: LocationItem;
  compact?: boolean;
}) {
  const rowClass = compact ? "items-start gap-3" : "items-start gap-4";
  const iconClass = compact ? "h-5 w-5" : "h-6 w-6";
  const phone = readText(location.phone);
  const email = readText(location.email);
  const phoneHref = phone ? createPhoneHref(phone) : undefined;

  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      {location.address && (
        <div className={`flex ${rowClass}`}>
          <MapPin className={`${iconClass} mt-1 shrink-0 text-primary`} />
          <p className="leading-relaxed text-text-muted">{location.address}</p>
        </div>
      )}
      {phone && phoneHref && (
        <div className={`flex ${rowClass}`}>
          <Phone className={`${iconClass} shrink-0 text-primary`} />
          <a
            href={phoneHref}
            className="font-medium text-text-muted transition-colors hover:text-primary"
          >
            {phone}
          </a>
        </div>
      )}
      {email && (
        <div className={`flex ${rowClass}`}>
          <Mail className={`${iconClass} shrink-0 text-primary`} />
          <a
            href={`mailto:${email}`}
            className="break-all font-medium text-text-muted transition-colors hover:text-primary"
          >
            {email}
          </a>
        </div>
      )}
      {location.workingHours && (
        <div className={`flex ${rowClass}`}>
          <Clock className={`${iconClass} shrink-0 text-primary`} />
          <p className="font-medium text-text-muted">{location.workingHours}</p>
        </div>
      )}
    </div>
  );
}

function LocationCard({
  location,
  labels,
  variant = "default",
}: {
  location: LocationItem;
  labels: LocationLabels;
  variant?: "default" | "compact";
}) {
  const compact = variant === "compact";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-xl hover:shadow-surface-inverse/5">
      <MapFrame
        location={location}
        labels={labels}
        className="h-60 border-b border-border"
      />

      <div
        className={
          compact
            ? "flex flex-1 flex-col p-6"
            : "flex flex-1 flex-col p-8 md:p-10"
        }
      >
        <h3
          className={
            compact
              ? "mb-5 text-xl font-extrabold text-text-main"
              : "mb-6 text-2xl font-extrabold text-text-main"
          }
        >
          {location.title}
        </h3>
        <ContactRows location={location} compact={compact} />
      </div>
    </article>
  );
}

function SingleLocationLayout({
  location,
  labels,
}: {
  location: LocationItem;
  labels: LocationLabels;
}) {
  const mapHref = createMapHref(location);

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-surface shadow-xl shadow-surface-inverse/5">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
        <MapFrame
          location={location}
          labels={labels}
          className="h-[360px] lg:h-full lg:min-h-[500px] lg:border-r lg:border-border"
        />

        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-sm font-bold text-primary">
            <MapPin className="h-4 w-4" />
            {labels.primaryLocation}
          </div>

          <h3 className="mb-6 text-3xl font-black leading-tight text-text-main md:text-4xl">
            {location.title}
          </h3>

          <ContactRows location={location} />

          {mapHref && (
            <a
              href={mapHref}
              target="_blank"
              rel="noreferrer"
              className="mt-10 inline-flex w-fit items-center gap-2 rounded-[var(--radius)] bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90"
            >
              {labels.openMap}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function resolveLayoutMode(mode: LocationLayoutMode | undefined, count: number) {
  if (mode && mode !== "auto") return mode;
  if (count === 1) return "single-column";
  if (count === 2) return "two-column";
  return "grid";
}

export async function LocationBlock({
  title,
  layoutMode = "auto",
  locations,
}: LocationBlockProps) {
  if (!locations || locations.length === 0) return null;

  const locale = await getRequestLocale();
  const labels: LocationLabels =
    locale === "en"
      ? {
          fallbackTitle: "Location",
          mapSuffix: "map",
          mapUnavailable: "Map Unavailable",
          primaryLocation: "Primary Location",
          openMap: "Open in Maps",
        }
      : {
          fallbackTitle: "Lokasyon",
          mapSuffix: "haritası",
          mapUnavailable: "Harita Yüklenmedi",
          primaryLocation: "Ana Lokasyon",
          openMap: "Haritada Aç",
        };
  const resolvedLayout = resolveLayoutMode(layoutMode, locations.length);

  return (
    <section className="bg-surface-muted/50 py-24">
      <div className="container mx-auto max-w-7xl px-4">
        {title && (
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-black tracking-tight text-text-main md:text-5xl">
              {title}
            </h2>
            <div className="mx-auto mt-6 h-1.5 w-20 rounded-full bg-primary" />
          </div>
        )}

        {resolvedLayout === "single-column" && (
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8">
            {locations.map((location, index) =>
              locations.length === 1 ? (
                <SingleLocationLayout
                  key={index}
                  location={location}
                  labels={labels}
                />
              ) : (
                <LocationCard key={index} location={location} labels={labels} />
              ),
            )}
          </div>
        )}

        {resolvedLayout === "two-column" && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {locations.map((location, index) => (
              <LocationCard key={index} location={location} labels={labels} />
            ))}
          </div>
        )}

        {resolvedLayout === "grid" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {locations.map((location, index) => (
              <LocationCard
                key={index}
                location={location}
                labels={labels}
                variant="compact"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
