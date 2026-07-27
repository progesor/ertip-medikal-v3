import type { Payload, Where } from "payload";

type MediaId = number | string;
type MediaRelation =
  | MediaId
  | {
      id?: MediaId | null;
    }
  | null
  | undefined;

type ProtectedMediaSnapshot = {
  ids: Set<string>;
  values: MediaId[];
};

let cachedSnapshot: ProtectedMediaSnapshot | null = null;
let snapshotPromise: Promise<ProtectedMediaSnapshot> | null = null;

export function getRelationId(relation: MediaRelation): MediaId | null {
  if (typeof relation === "string" || typeof relation === "number") {
    return relation;
  }

  if (
    relation &&
    typeof relation === "object" &&
    (typeof relation.id === "string" || typeof relation.id === "number")
  ) {
    return relation.id;
  }

  return null;
}

async function loadProtectedMediaSnapshot(
  payload: Payload,
): Promise<ProtectedMediaSnapshot> {
  const ids = new Set<string>();
  const values: MediaId[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const result = await payload.find({
      collection: "products",
      depth: 0,
      draft: true,
      limit: 100,
      page,
      overrideAccess: true,
      select: {
        protectedDocs: true,
      },
    });

    for (const product of result.docs) {
      for (const document of product.protectedDocs ?? []) {
        const mediaId = getRelationId(document.file);

        if (mediaId === null || ids.has(String(mediaId))) continue;

        ids.add(String(mediaId));
        values.push(mediaId);
      }
    }

    hasNextPage = result.hasNextPage;
    page += 1;
  }

  return { ids, values };
}

export async function getProtectedMediaSnapshot(
  payload: Payload,
): Promise<ProtectedMediaSnapshot> {
  if (cachedSnapshot) return cachedSnapshot;

  if (!snapshotPromise) {
    snapshotPromise = loadProtectedMediaSnapshot(payload)
      .then((snapshot) => {
        cachedSnapshot = snapshot;
        return snapshot;
      })
      .finally(() => {
        snapshotPromise = null;
      });
  }

  return snapshotPromise;
}

export function invalidateProtectedMediaCache() {
  cachedSnapshot = null;
  snapshotPromise = null;
}

export async function getAnonymousMediaReadAccess(
  payload: Payload,
  id?: MediaId | null,
): Promise<boolean | Where> {
  const snapshot = await getProtectedMediaSnapshot(payload);

  if (id !== undefined && id !== null) {
    return !snapshot.ids.has(String(id));
  }

  if (snapshot.values.length === 0) return true;

  return {
    id: {
      not_in: snapshot.values,
    },
  };
}
