import type { AdminViewServerProps } from "payload";
import { notFound } from "next/navigation";
import { isContentManager } from "@/access/roles";
import { CatalogEditor } from "./CatalogEditor";

export function CatalogStudio({ initPageResult }: AdminViewServerProps) {
  if (
    initPageResult.req.user?.collection !== "users" ||
    !isContentManager(initPageResult.req.user)
  )
    notFound();
  return <CatalogEditor />;
}
