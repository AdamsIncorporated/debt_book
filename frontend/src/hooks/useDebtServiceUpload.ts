import { useCallback } from "react";
import ExcelJS from "exceljs";
import { validateDebtServiceBatch } from "../utils/validate";
import { DebtService } from "../Constants/Constants";

type ParseError = {
  rowIndex: number;
  field: keyof DebtService | string;
  message: string;
  rawValue?: unknown;
};

const isBlank = (v: unknown) => v === null || v === undefined || v === "";

function tryParse<T>(
  rowIndex: number,
  field: string,
  rawValue: unknown,
  parse: (raw: unknown) => T,
  fallback: T,
  errors: ParseError[],
): T {
  try {
    return parse(rawValue);
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : typeof e === "string"
          ? e
          : "Unknown error";
    errors.push({ rowIndex, field, message, rawValue });
    return fallback;
  }
}

export const useDebtServiceUpload = ({
  columns,
  seriesId,
  setRows,
  setError,
}: any) =>
  useCallback(
    async (file: File) => {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(await file.arrayBuffer());

      const ws = wb.worksheets[0];
      if (!ws) {
        setError(["No worksheet found in uploaded file."]);
        return;
      }

      const parseErrors: ParseError[] = [];
      const parsed: any[] = [];

      const sheetValues = ws.getSheetValues() as unknown[][];

      for (let r = 2; r < sheetValues.length; r++) {
        const row = sheetValues[r];
        if (!row) continue;

        const relevantCells = columns.map(
          (_: any, idx: number) => row[idx + 1],
        );
        if (!relevantCells.some((v: any) => !isBlank(v))) continue;

        // ✅ start object with series_id
        const item: any = { series_id: seriesId };

        // ✅ parse spreadsheet-backed columns
        for (let c = 0; c < columns.length; c++) {
          const col = columns[c];
          const raw = row[c + 1];

          item[col.key] = col.parse
            ? tryParse(
                r,
                String(col.key),
                raw,
                col.parse,
                col.fallback,
                parseErrors,
              )
            : raw;
        }

        // ✅ CRITICAL: force series_id AFTER parsing
        // prevents accidental overwrite by column loop
        item.series_id = seriesId;

        parsed.push(item);
      }

      const parseErrorLines = parseErrors.map(
        (e) =>
          `Row ${e.rowIndex}, ${e.field}: ${e.message}` +
          (e.rawValue !== undefined ? ` (value: ${String(e.rawValue)})` : ""),
      );

      const rowsForValidation = parsed.map((r) => ({
        ...r,
        id: (r.id ?? 0) as any,
      })) as any;

      const validation = validateDebtServiceBatch(rowsForValidation);
      const allErrors = [
        ...parseErrorLines,
        ...(validation.valid ? [] : validation.errors),
      ];

      if (allErrors.length) {
        setError(allErrors);
        return;
      }

      setError(null);
      setRows(parsed);
    },
    [columns, seriesId, setRows, setError],
  );
