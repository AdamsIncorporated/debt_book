import {
  PATCH_DEBT_SERIES,
  PATCH_DEBT_PRICING,
  PATCH_DEBT_SERVICE,
  POST_DEBT_PRICING,
  POST_DEBT_SERVICE,
  GET_SERIES_ID_BY_NAME,
} from "../Constants/Constants";
import ExcelJS from "exceljs";

export function formatNumber(value: any) {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function excelNumberToJSONNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}

export function excelDateToJSONString(value: unknown): string {
  let date: Date;

  // 1️⃣ Already a JS Date
  if (value instanceof Date) {
    date = value;
  }
  // 2️⃣ Excel serial number
  else if (typeof value === "number") {
    // Excel epoch starts at 1899-12-30
    date = new Date((value - 25569) * 86400 * 1000);
  }
  // 3️⃣ String date
  else if (typeof value === "string") {
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid date string: ${value}`);
    }
    date = parsed;
  } else {
    throw new Error(`Unsupported date value: ${value}`);
  }

  // ✅ Force YYYY-MM-DD
  return date.toISOString().split("T")[0];
}

export async function downloadExcelTemplate(
  fileName: string,
  sheetName: string,
  headers: string[],
  data: any[] = [],
) {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet(sheetName);

  // ✅ Set columns FIRST — this also writes the header row
  ws.columns = headers.map((h) => ({ header: h, width: h.length + 5 }));

  // ✅ Now add data rows after
  data.forEach((row) => {
    if (Array.isArray(row)) {
      ws.addRow(row);
    } else if (typeof row === "object") {
      ws.addRow(headers.map((h) => row[h] ?? ""));
    }
  });

  // Generate buffer and create blob
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Trigger download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

type DiffResult<T> = {
  inserts: T[];
  updates: T[];
  deletes: T[];
};

export type SubmitPayload = {
  series: { original: any; current: any };
  pricing: { original: any[]; current: any[] };
  service: { original: any[]; current: any[] };
};

export function diffArray<T extends { id?: number }>(
  original: T[],
  current: T[],
): DiffResult<T> {
  const inserts: T[] = [];
  const updates: T[] = [];
  const deletes: T[] = [];

  const origMap = new Map(original.map((item) => [item.id, item]));

  // INSERTS + UPDATES
  current.forEach((item) => {
    if (!item.id) {
      inserts.push(item);
    } else {
      const orig = origMap.get(item.id);
      if (orig && JSON.stringify(orig) !== JSON.stringify(item)) {
        updates.push(item);
      }
    }
  });

  // DELETES
  original.forEach((item) => {
    const stillExists = current.some((r) => r.id === item.id);
    if (!stillExists) deletes.push(item);
  });

  return { inserts, updates, deletes };
}

export async function performCrudOperations(payload: SubmitPayload) {
  const pricing = diffArray(payload.pricing.original, payload.pricing.current);
  const service = diffArray(payload.service.original, payload.service.current);

  let seriesId = payload.series.current?.id;

  const ops: Promise<any>[] = [];

  /**
   * 1. SERIES INSERT OR UPDATE
   */
  let seriesResponse: any = null;

  const seriesChanged =
    JSON.stringify(payload.series.original) !==
    JSON.stringify(payload.series.current);

  if (seriesChanged) {
    seriesResponse = await patch(PATCH_DEBT_SERIES, payload.series.current);

    // 🔥 IMPORTANT: capture returned ID for new inserts
    seriesId =
      seriesResponse?.data?.id ?? seriesResponse?.data?.series_id ?? seriesId;
  }

  /**
   * 2. Inject seriesId into children (ONLY FOR INSERTS)
   */
  const pricingInserts = pricing.inserts.map((p) => ({
    ...p,
    series_id: seriesId,
  }));

  const serviceInserts = service.inserts.map((s) => ({
    ...s,
    series_id: seriesId,
  }));

  /**
   * 3. PRICING OPS
   */
  if (pricingInserts.length > 0) {
    ops.push(post(POST_DEBT_PRICING, { patches: pricingInserts }));
  }

  if (pricing.updates.length > 0) {
    ops.push(patch(PATCH_DEBT_PRICING, { patches: pricing.updates }));
  }

  if (pricing.deletes.length > 0) {
    ops.push(del(PATCH_DEBT_PRICING, { patches: pricing.deletes }));
  }

  /**
   * 4. SERVICE OPS
   */
  if (serviceInserts.length > 0) {
    ops.push(post(POST_DEBT_SERVICE, { patches: serviceInserts }));
  }

  if (service.updates.length > 0) {
    ops.push(patch(PATCH_DEBT_SERVICE, { patches: service.updates }));
  }

  if (service.deletes.length > 0) {
    ops.push(del(PATCH_DEBT_SERVICE, { patches: service.deletes }));
  }

  return Promise.all(ops);
}

async function post(url: string, body: any) {
  console.log("POST →", url, "BODY →", body);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    console.log("POST STATUS →", res.status);

    const data = await res.json().catch(() => null);
    console.log("POST RESPONSE →", data);

    return { status: res.status, data };
  } catch (err) {
    console.error("POST ERROR →", err);
    throw err;
  }
}

async function patch(url: string, body: any) {
  console.log("PATCH →", url, "BODY →", body);

  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    console.log("PATCH STATUS →", res.status);

    const data = await res.json().catch(() => null);
    console.log("PATCH RESPONSE →", data);

    return { status: res.status, data };
  } catch (err) {
    console.error("PATCH ERROR →", err);
    throw err;
  }
}

async function del(url: string, body?: any) {
  console.log("DELETE →", url, "BODY →", body);

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log("DELETE STATUS →", res.status);

    const data = await res.json().catch(() => null);
    console.log("DELETE RESPONSE →", data);

    return { status: res.status, data };
  } catch (err) {
    console.error("DELETE ERROR →", err);
    throw err;
  }
}
