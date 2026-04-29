import { post, patch, del } from "./api";
import { diffDataset } from "./diffSubmit";

/* ============================================================
 * Submit orchestration
 * ============================================================
 */

type SubmitWithDiffArgs<T, K extends keyof T> = {
  postUrl: string;
  patchUrl: string;
  deleteUrl: string;
  originalRows: T[];
  currentRows: T[];
  idKey: K;
};

/**
 * Master submit function.
 * Owns URLs and execution.
 */
export async function submitWithDiff<T, K extends keyof T>({
  postUrl,
  patchUrl,
  deleteUrl,
  originalRows,
  currentRows,
  idKey,
}: SubmitWithDiffArgs<T, K>) {
  const { toCreate, toUpdate, toDelete } = diffDataset(
    originalRows,
    currentRows,
    idKey,
  );

  // Optional fast‑exit
  if (!toCreate.length && !toUpdate.length && !toDelete.length) {
    return;
  }

  try {
    for (const row of toDelete) {
      const id = row[idKey] as any;
      console.log("Deleting", { id, row });
      await del(deleteUrl, id);
    }

    for (const { changes } of toUpdate) {
      console.log("Patching", { id: changes[idKey], changes });
      await patch<T>(patchUrl, changes);
    }

    for (const row of toCreate) {
      console.log("Posting", { row });
      await post(postUrl, row);
    }
  } catch (err) {
    console.error("Submit failed", err);
    throw err;
  }
}
