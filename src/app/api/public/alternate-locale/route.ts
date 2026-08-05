import { NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { resolveAlternateLocaleHref } from "@/lib/i18n/alternateLocale";
import { parseLocalizedPublicPath } from "@/lib/i18n/routing";

const MAX_PATHNAME_LENGTH = 2_048;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const pathname = requestUrl.searchParams.get("pathname")?.trim() || "";

  if (
    !pathname.startsWith("/") ||
    pathname.length > MAX_PATHNAME_LENGTH ||
    pathname.includes("\0")
  ) {
    return NextResponse.json(
      { message: "Invalid pathname." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const route = parseLocalizedPublicPath(pathname);

  if (!route) {
    return NextResponse.json(
      { message: "Localized route not found." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const payload = await getPayload({ config: configPromise });
  const alternateLocale = await resolveAlternateLocaleHref({
    payload,
    currentLocale: route.locale,
    publicPathname: pathname,
  });

  return NextResponse.json(alternateLocale, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
