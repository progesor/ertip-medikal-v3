import type { Metadata } from "next";
import { UnsubscribeClient } from "@/components/newsletter/UnsubscribeClient";
import { getRequestLocale } from "@/lib/i18n/requestLocale";
import { getUiDictionary } from "@/lib/i18n/uiDictionary";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dictionary = getUiDictionary(locale);

  return {
    title: dictionary.unsubscribe.metadataTitle,
    robots: {
      index: false,
      follow: false,
    },
  };
}

type Props = {
  searchParams: Promise<{
    token?: string | string[];
  }>;
};

export default async function UnsubscribePage({ searchParams }: Props) {
  const { token: tokenParam } = await searchParams;
  const token =
    typeof tokenParam === "string" ? tokenParam.trim().slice(0, 4_096) : "";

  return token ? <UnsubscribeClient token={token} /> : <UnsubscribeClient />;
}
