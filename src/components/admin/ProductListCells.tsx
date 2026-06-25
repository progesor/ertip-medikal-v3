import Link from "next/link";
import Image from "next/image";
import { Images, Package, Pencil } from "lucide-react";
import type { DefaultServerCellComponentProps } from "payload";

function getThumbnail(rowData: Record<string, any>) {
  const image = rowData.mainImage;

  if (!image || typeof image !== "object") return null;

  return image.sizes?.thumbnail?.url || image.url || null;
}

export function ProductTitleCell({
  cellData,
  collectionSlug,
  linkURL,
  rowData,
}: DefaultServerCellComponentProps) {
  const thumbnail = getThumbnail(rowData);
  const editURL =
    linkURL ||
    (rowData.id
      ? `/admin/collections/${collectionSlug}/${rowData.id}`
      : undefined);
  const content = (
    <>
      <span className="ertip-product-cell__image">
        {thumbnail ? (
          <Image src={thumbnail} alt="" width={42} height={42} unoptimized />
        ) : (
          <Package size={18} aria-hidden="true" />
        )}
      </span>
      <span className="ertip-product-cell__content">
        <strong>{String(cellData || "İsimsiz ürün")}</strong>
        <small>{rowData.sku || "Ana SKU yok"}</small>
      </span>
      <span className="ertip-product-cell__edit" aria-hidden="true">
        <Pencil size={13} />
        Düzenle
      </span>
    </>
  );

  if (!editURL) {
    return <span className="ertip-product-cell">{content}</span>;
  }

  return (
    <Link
      aria-label={`${String(cellData || "Ürün")} ürününü düzenle`}
      className="ertip-product-cell"
      href={editURL}
    >
      {content}
    </Link>
  );
}

export function VariantSummaryCell({
  cellData,
}: DefaultServerCellComponentProps) {
  const variants = Array.isArray(cellData) ? cellData : [];
  const activeCount = variants.filter(
    (variant) => variant?.isActive !== false,
  ).length;
  const imageGroups = variants.filter(
    (variant) =>
      Array.isArray(variant?.variantImages) && variant.variantImages.length > 0,
  ).length;

  if (variants.length === 0) {
    return <span className="ertip-list-muted">Standart ürün</span>;
  }

  return (
    <span className="ertip-variant-cell">
      <strong>{variants.length} varyant</strong>
      <small>
        {activeCount} aktif
        {imageGroups > 0 ? (
          <>
            <Images size={12} aria-hidden="true" />
            {imageGroups} görsel grubu
          </>
        ) : null}
      </small>
    </span>
  );
}
