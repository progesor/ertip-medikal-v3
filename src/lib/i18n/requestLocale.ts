import "server-only";

import { headers } from "next/headers";
import {
  isSiteLocale,
  localeRequestHeader,
  payloadDefaultLocale,
  publicPathRequestHeader,
  type SiteLocale,
} from "@/lib/i18n/config";

export async function getRequestLocale(): Promise<SiteLocale> {
  const requestHeaders = await headers();
  const value = requestHeaders.get(localeRequestHeader);

  return value && isSiteLocale(value) ? value : payloadDefaultLocale;
}

export async function getPublicPathname() {
  const requestHeaders = await headers();
  return requestHeaders.get(publicPathRequestHeader) || "/";
}
