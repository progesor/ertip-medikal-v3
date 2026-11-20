export type ExportRecord = Record<string, unknown>;
export type ProductExportOptions = {
  scope: "all" | "categories" | "products";
  categoryIds: number[];
  productIds: number[];
  includeChildren: boolean;
  status: "published" | "all" | "draft";
  includeImages: boolean;
  includeDocuments: boolean;
};
export type ProductExportJob = {
  id: string;
  createdAt: string;
  expiresAt: string;
  status: "running" | "done" | "failed";
  phase: string;
  options: ProductExportOptions;
  productCount: number;
  fileCount: number;
  processedFiles: number;
  bytes: number;
  warnings: string[];
  error?: string;
  pid?: number;
  started?: number;
};
export type ExportMediaReference = {
  collection: string;
  recordId: number;
  field: string;
  mediaId: number;
  kind: "image" | "document";
};
export type ExportAsset = {
  id: number;
  metadata: ExportRecord | null;
  archivePath: string | null;
  status: "included" | "excluded" | "missing";
  sha256?: string;
  bytes?: number;
};
export type ProductExportData = {
  products: ExportRecord[];
  categories: ExportRecord[];
  references: ExportMediaReference[];
  media: ExportRecord[];
  fields: ExportRecord[];
};
