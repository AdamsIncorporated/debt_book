import {
  DebtPricing,
  DebtService,
  PATCH_DEBT_SERIES,
  PATCH_DEBT_PRICING,
  PATCH_DEBT_SERVICE,
  POST_DEBT_SERIES,
  POST_DEBT_PRICING,
  POST_DEBT_SERVICE,
  DELETE_ALL_SERIES,
  DebtSeries,
} from "../Constants/Constants";
import ExcelJS from "exceljs";

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
  //
  // SERIES (single object)
  //
  const seriesChanged =
    JSON.stringify(payload.series.original) !==
    JSON.stringify(payload.series.current);

  const seriesUpdate = seriesChanged ? payload.series.current : null;

  //
  // ARRAYS
  //
  const pricing = diffArray(payload.pricing.original, payload.pricing.current);
  const service = diffArray(payload.service.original, payload.service.current);

  //
  // SEND TO SERVER (using backend struct format)
  //
  const ops: Promise<any>[] = [];

  //
  // SERIES: backend expects DebtSeriesPatch (NOT wrapped)
  //
  if (seriesUpdate) {
    ops.push(patch(PATCH_DEBT_SERIES, seriesUpdate));
  }

  //
  // PRICING INSERTS
  //
  if (pricing.inserts.length > 0) {
    ops.push(post(POST_DEBT_PRICING, { patches: pricing.inserts }));
  }

  //
  // PRICING UPDATES
  //
  if (pricing.updates.length > 0) {
    ops.push(patch(PATCH_DEBT_PRICING, { patches: pricing.updates }));
  }

  //
  // PRICING DELETES
  //
  if (pricing.deletes.length > 0) {
    ops.push(del(PATCH_DEBT_PRICING, { patches: pricing.deletes }));
  }

  //
  // SERVICE INSERTS
  //
  if (service.inserts.length > 0) {
    ops.push(post(POST_DEBT_SERVICE, { patches: service.inserts }));
  }

  //
  // SERVICE UPDATES
  //
  if (service.updates.length > 0) {
    ops.push(patch(PATCH_DEBT_SERVICE, { patches: service.updates }));
  }

  //
  // SERVICE DELETES
  //
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

export function formatNumber(value: any) {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
