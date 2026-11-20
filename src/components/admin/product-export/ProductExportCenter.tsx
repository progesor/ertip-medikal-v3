import { notFound } from "next/navigation";
import type { AdminViewServerProps } from "payload";
import { isAdmin } from "@/access/roles";
import { ProductExportControls } from "./ProductExportControls";
export function ProductExportCenter({ initPageResult }: AdminViewServerProps) {
  if (!isAdmin(initPageResult.req.user)) notFound();
  return <ProductExportControls />;
}
