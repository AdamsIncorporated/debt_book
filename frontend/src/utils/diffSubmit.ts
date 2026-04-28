import { post, patch, del } from "./api";

/* ============================================================
 * Diff helpers
 * ============================================================
 */

function diffRow<T extends Record<string, any>>(
  before: T,
  after: T,
  ignoreKeys: (keyof T)[] = [],
): Partial<T> {
  const result: Partial<T> = {};

  for (const key of Object.keys(after) as (keyof T)[]) {
    if (ignoreKeys.includes(key)) continue;
    if (before[key] !== after[key]) {
      result[key] = after[key];
    }
  }

  return result;
}

/**
 * Pure diffing function.
 * No API knowledge. No URL knowledge.
 */
export function diffDataset<T, K extends keyof T>(
  original: T[],
  current: T[],
  idKey: K,
) {
  const getId = (row: T) =>
    row[idKey] as unknown as string | number | undefined;

  const originalById = new Map(
    original.map((r) => [getId(r), r] as const).filter(([id]) => id != null),
  );

  const currentById = new Map(
    current.map((r) => [getId(r), r] as const).filter(([id]) => id != null),
  );

  const toCreate = current.filter((r) => getId(r) == null);

  const toDelete = original.filter(
    (r) => getId(r) != null && !currentById.has(getId(r)!),
  );

  const toUpdate = current
    .filter((r) => getId(r) != null && originalById.has(getId(r)!))
    .map((r) => {
      const before = originalById.get(getId(r)!)!;
      const changes = diffRow(before as any, r as any, [idKey]);
      return Object.keys(changes).length ? { id: getId(r)!, changes } : null;
    })
    .filter(Boolean) as {
    id: string | number;
    changes: Partial<T>;
  }[];

  return { toCreate, toUpdate, toDelete };
}
