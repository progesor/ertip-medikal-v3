import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { SiteLocale } from "./config";
import { localizeInternalHref, parseLocalizedPublicPath } from "./routing";

function pageSlug(href: string, locale: SiteLocale) {
  if (!href.startsWith("/") || href.startsWith("//")) return;
  const pathname = href.split(/[?#]/, 1)[0];
  if (/^\/(admin|api)(\/|$)|\.[a-z0-9]+$/i.test(pathname)) return;
  const route = parseLocalizedPublicPath(localizeInternalHref(pathname, locale));
  if (route?.kind === "page" && route.slug && !route.slug.includes("/")) return route.slug;
}

// Keep links to planned pages editable in the CMS, and show them once published.
export const getPublicFooterSettings = cache(async (locale: SiteLocale) => {
  const payload = await getPayload({ config });
  const settings = await payload.findGlobal({ slug: "site-settings", locale, fallbackLocale: false, depth: 2 });
  const footer = settings.footer;
  if (!footer) return settings;

  const columns = footer.columns || [];
  const bottomLinks = footer.bottomLinks || [];
  const links = [...bottomLinks, ...columns.flatMap(column =>
    column.blockType === "menuColumn" ? column.links || [] : [],
  )];
  const slugs = [...new Set(links.flatMap(link => {
    const slug = pageSlug(link.url || "", locale);
    return slug ? [slug] : [];
  }))];
  if (!slugs.length) return settings;

  const { docs } = await payload.find({
    collection: "pages", locale, fallbackLocale: false, depth: 0, pagination: false,
    where: { _status: { equals: "published" }, slug: { in: slugs } }, select: { slug: true },
  });
  const published = new Set(docs.map(doc => doc.slug));
  const visible = (link: { url?: string | null }) => {
    const slug = pageSlug(link.url || "", locale);
    return !slug || published.has(slug);
  };

  return { ...settings, footer: {
    ...footer, bottomLinks: bottomLinks.filter(visible),
    columns: columns.map(column => column.blockType === "menuColumn"
      ? { ...column, links: column.links?.filter(visible) } : column),
  } };
});