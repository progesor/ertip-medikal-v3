export type QuoteItemRequest = {
  productId: string;
  combinationKey?: string;
  sku?: string;
  quantity: number;
};

export type QuoteProductVariant = {
  combinationKey?: unknown;
  title?: unknown;
  sku?: unknown;
  isActive?: unknown;
};

export type QuoteProductRecord = {
  id: string | number;
  title?: unknown;
  sku?: unknown;
  _status?: unknown;
  variants?: unknown;
};

export type ResolvedQuoteItem = {
  productTitle: string;
  variantInfo: string;
  sku: string;
  quantity: number;
};

export type QuoteItemResolutionResult =
  | { ok: true; items: ResolvedQuoteItem[] }
  | { ok: false; message: string };

export type QuoteProductLoader = (
  productId: string,
) => Promise<QuoteProductRecord | null>;

function readTrimmedString(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function readProductId(value: unknown): string {
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0) {
    return String(value);
  }

  return readTrimmedString(value, 128);
}

function parseQuoteItemRequests(rawItems: unknown):
  | { ok: true; items: QuoteItemRequest[] }
  | { ok: false; message: string } {
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 50) {
    return {
      ok: false,
      message: "Teklif listesi geçerli ürünler içermelidir.",
    };
  }

  const parsedItems: QuoteItemRequest[] = [];

  for (const rawItem of rawItems) {
    if (!rawItem || typeof rawItem !== "object") {
      return { ok: false, message: "Teklif listesindeki bir ürün geçersiz." };
    }

    const item = rawItem as Record<string, unknown>;
    const productId = readProductId(item.productId);
    const combinationKey = readTrimmedString(item.combinationKey, 500);
    const sku = readTrimmedString(item.sku, 120);
    const numericQuantity =
      typeof item.quantity === "number" ? item.quantity : Number(item.quantity);

    if (
      !productId ||
      !Number.isInteger(numericQuantity) ||
      numericQuantity < 1 ||
      numericQuantity > 999
    ) {
      return { ok: false, message: "Teklif listesindeki bir ürün geçersiz." };
    }

    parsedItems.push({
      productId,
      ...(combinationKey ? { combinationKey } : {}),
      ...(sku ? { sku } : {}),
      quantity: numericQuantity,
    });
  }

  return { ok: true, items: parsedItems };
}

function readVariants(product: QuoteProductRecord): QuoteProductVariant[] {
  if (!Array.isArray(product.variants)) return [];

  return product.variants.filter(
    (variant): variant is QuoteProductVariant =>
      Boolean(variant) && typeof variant === "object",
  );
}

function productUnavailable(position: number): QuoteItemResolutionResult {
  return {
    ok: false,
    message: `Teklif listesindeki ${position}. ürün artık kullanılamıyor. Lütfen sepetten çıkarıp yeniden ekleyin.`,
  };
}

export async function resolveQuoteItems(
  rawItems: unknown,
  loadProduct: QuoteProductLoader,
): Promise<QuoteItemResolutionResult> {
  const parsed = parseQuoteItemRequests(rawItems);
  if (!parsed.ok) return parsed;

  const productCache = new Map<
    string,
    Promise<QuoteProductRecord | null>
  >();
  const resolvedByIdentity = new Map<
    string,
    { item: ResolvedQuoteItem; order: number }
  >();

  for (const [index, requestItem] of parsed.items.entries()) {
    let productPromise = productCache.get(requestItem.productId);
    if (!productPromise) {
      productPromise = loadProduct(requestItem.productId);
      productCache.set(requestItem.productId, productPromise);
    }

    const product = await productPromise;
    const position = index + 1;

    if (!product || (product._status && product._status !== "published")) {
      return productUnavailable(position);
    }

    const productTitle = readTrimmedString(product.title, 200);
    if (!productTitle) return productUnavailable(position);

    const variants = readVariants(product);
    let resolvedItem: ResolvedQuoteItem;
    let identity: string;

    if (variants.length > 0) {
      const matchingVariants = requestItem.combinationKey
        ? variants.filter(
            (variant) =>
              readTrimmedString(variant.combinationKey, 500) ===
              requestItem.combinationKey,
          )
        : requestItem.sku
          ? variants.filter(
              (variant) =>
                readTrimmedString(variant.sku, 120) === requestItem.sku,
            )
          : [];

      if (matchingVariants.length !== 1) return productUnavailable(position);

      const variant = matchingVariants[0];
      if (variant.isActive === false) return productUnavailable(position);

      const variantTitle = readTrimmedString(variant.title, 200);
      const variantSku = readTrimmedString(variant.sku, 120);
      if (!variantTitle || !variantSku) return productUnavailable(position);

      const stableCombinationKey = readTrimmedString(
        variant.combinationKey,
        500,
      );
      identity = `${requestItem.productId}::${
        stableCombinationKey || variantSku
      }`;
      resolvedItem = {
        productTitle,
        variantInfo: variantTitle,
        sku: variantSku,
        quantity: requestItem.quantity,
      };
    } else {
      const productSku = readTrimmedString(product.sku, 120);
      identity = `${requestItem.productId}::standard`;
      resolvedItem = {
        productTitle,
        variantInfo: "Standart",
        sku: productSku,
        quantity: requestItem.quantity,
      };
    }

    const existing = resolvedByIdentity.get(identity);
    if (existing) {
      const combinedQuantity = existing.item.quantity + resolvedItem.quantity;
      if (combinedQuantity > 999) {
        return {
          ok: false,
          message: "Aynı ürün için toplam miktar 999 adedi aşamaz.",
        };
      }

      existing.item.quantity = combinedQuantity;
      continue;
    }

    resolvedByIdentity.set(identity, {
      item: resolvedItem,
      order: index,
    });
  }

  const items = [...resolvedByIdentity.values()]
    .sort((first, second) => first.order - second.order)
    .map(({ item }) => item);

  return { ok: true, items };
}
