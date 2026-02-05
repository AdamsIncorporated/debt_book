// utils/downloadExcelTemplate.ts
import ExcelJS from "exceljs";

/**
 * Download an Excel template with custom headers.
 *
 * @param fileName - The name of the file to download (e.g., "DebtService.xlsx")
 * @param sheetName - The name of the worksheet (e.g., "Debt Service")
 * @param headers - An array of column headers (e.g., ["Payment Date", "Principal", "Interest"])
 */
export async function downloadExcelTemplate(
  fileName: string,
  sheetName: string,
  headers: string[],
) {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet(sheetName);

  // Add header row
  ws.addRow(headers);

  // Optional: auto-width for columns
  ws.columns = headers.map((h) => ({ header: h, width: h.length + 5 }));

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
