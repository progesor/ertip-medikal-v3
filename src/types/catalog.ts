import type { z } from "zod";
import type { catalogConfigSchema } from "@/lib/catalog/schema";

export type CatalogConfig = z.infer<typeof catalogConfigSchema>;
export type CatalogImage = {
  id: number;
  url: string;
  filename: string;
  width: number;
  height: number;
};
export type CatalogProduct = {
  id: number;
  title: string;
  sku: string;
  category: string;
  updatedAt: string;
  description: string;
  image: CatalogImage | null;
  gallery: CatalogImage[];
  specs: { key: string; value: string }[];
  options: { key: string; value: string }[];
  dimensions: string;
  packaging: string[];
  link: string;
};
export type CatalogWarning = { productId?: number; message: string };
export type CatalogSnapshot = {
  title: string;
  config: CatalogConfig;
  products: CatalogProduct[];
  coverImage: CatalogImage | null;
  warnings: CatalogWarning[];
  createdAt: string;
};
export type CatalogDocument = {
  id: number;
  title: string;
  isTemplate?: boolean | null;
  config: CatalogConfig;
  updatedAt: string;
};
export type CatalogOutputSummary = {
  id: number;
  title: string;
  status: string;
  error?: string | null;
  url?: string | null;
  filename?: string | null;
  createdAt: string;
  pages?: number | null;
};
