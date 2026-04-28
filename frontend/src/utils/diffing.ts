function diffRow<T extends Record<string, any>>(
  before: T,
  after: T,
  ignoreKeys: (keyof T)[] = ["id"],
): Partial<T> {
  return Object.keys(after).reduce((acc, key) => {
    if (ignoreKeys.includes(key as keyof T)) return acc;
    if (before[key] !== after[key]) {
      acc[key as keyof T] = after[key];
    }
    return acc;
  }, {} as Partial<T>);
}

function diffDataset<T extends { id?: string | number }>(
  original: T[],
  current: T[],
) {
  const originalMap = new Map(
    original.filter((r) => r.id).map((r) => [r.id, r]),
  );
  const currentMap = new Map(current.filter((r) => r.id).map((r) => [r.id, r]));

  const toCreate = current.filter((r) => !r.id);

  const toDelete = original.filter((r) => r.id && !currentMap.has(r.id));

  const toUpdate = current
    .filter((r) => r.id && originalMap.has(r.id))
    .map((r) => {
      const before = originalMap.get(r.id!)!;
      const changes = diffRow(before, r);
      return Object.keys(changes).length ? { id: r.id!, changes } : null;
    })
    .filter(Boolean) as { id: string | number; changes: Partial<T> }[];

  return { toCreate, toUpdate, toDelete };
}
