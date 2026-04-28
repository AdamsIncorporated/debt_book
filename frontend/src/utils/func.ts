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

