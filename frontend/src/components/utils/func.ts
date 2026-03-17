// utils/downloadExcelTemplate.ts
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
