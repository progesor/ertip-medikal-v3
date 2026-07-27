import type { Metadata } from "next";
import { UnsubscribeClient } from "@/components/newsletter/UnsubscribeClient";

export const metadata: Metadata = {
  title: "Abonelikten Ayrıl | Ertip Medikal",
  robots: {
    index: false,
    follow: false,
  },
};

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
