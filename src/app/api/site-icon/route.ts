import configPromise from "@payload-config";
import { getPayload } from "payload";
import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/config/env";

export const dynamic = "force-dynamic";

function getMediaUrl(media: unknown) {
  return typeof media === "object" && media !== null && "url" in media
    ? String((media as { url?: string }).url || "")
    : "";
}

const fallbackIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Ertip Medikal">
  <rect width="64" height="64" rx="14" fill="#075985"/>
  <path d="M18 16h25v8H27v8h14v8H27v8h17v8H18z" fill="#fff"/>
  <path d="M47 12v8h8v6h-8v8h-6v-8h-8v-6h8v-8z" fill="#38bdf8"/>
</svg>
`.trim();

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });
    const settings = await payload.findGlobal({
      slug: "site-settings",
      depth: 1,
    });
    const general = (settings as { general?: Record<string, unknown> })
      .general;
    const iconUrl =
      getMediaUrl(general?.symbolLogo) || getMediaUrl(general?.siteLogo);

    if (iconUrl) {
      return NextResponse.redirect(
        new URL(iconUrl, serverEnv.publicSiteUrl),
        {
          status: 307,
          headers: {
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          },
        },
      );
    }
  } catch {
    // The fallback below keeps browser metadata available during bootstrap or
    // temporary database/media outages without exposing internal errors.
  }

  return new NextResponse(fallbackIcon, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
