import React, { useCallback, useEffect, useMemo, useState } from "react";
import ExcelJS from "exceljs";
import {
  downloadExcelTemplate,
  excelDateToJSONString,
  excelNumberToJSONNumber,
} from "../../utils/func";
import {
  DebtService,
  getSeriesDebtServiceById,
} from "../../Constants/Constants";
import { DataTable } from "../Widgets/DataTable";
import { UploadBar } from "../Widgets/UploadBar";
import { validateDebtServiceBatch } from "../../utils/validate";
import { fetchById } from "../../utils/api";
import { SkeletonTable } from "../Widgets/SkeletonTable";
import { useParams } from "react-router-dom";

type ParseError = {
  rowIndex: number; // Excel row number (1-based)
  field: keyof DebtService | string;
  message: string;
  rawValue?: unknown;
};

// Allow blank id during upload for inserts
type DebtServiceUploadRow = Omit<DebtService, "id"> & { id?: number };

type ColumnDef<K extends keyof DebtServiceUploadRow> = {
  label: string;
  key: K;
  align?: "right";
  format?: "number";
  // parse converts raw excel cell -> typed value
  parse?: (raw: unknown) => DebtServiceUploadRow[K];
  // value used if parse throws
  fallback?: DebtServiceUploadRow[K];
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

const DebtServiceUpload: React.FC = () => {
  const { seriesIdParam } = useParams<{ seriesIdParam?: string }>();
  const seriesId = seriesIdParam ? Number(seriesIdParam) : undefined;
  const [rows, setRows] = useState<DebtService[]>([]);
  const [error, setError] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Single source of truth: labels + parsing rules (extra properties won't hurt DataTable)
  const COLUMNS = useMemo<ColumnDef<keyof DebtServiceUploadRow>[]>(() => {
    const parseOptionalNumber = (raw: unknown) => {
      if (isBlank(raw)) return undefined; // ✅ allow inserts
      return excelNumberToJSONNumber(raw) as any;
    };

    const parseOptionalDate = (raw: unknown) => {
      if (isBlank(raw)) return undefined;
      return excelDateToJSONString(raw) as any;
    };

    const parseRequiredNumber = (raw: unknown) => {
      // Treat blank as undefined; validator can decide if it's required.
      if (isBlank(raw)) return undefined;
      return excelNumberToJSONNumber(raw) as any;
    };

    return [
      {
        label: "Id",
        key: "id",
        parse: parseOptionalNumber,
        fallback: undefined,
      },
      {
        label: "Payment Date",
        key: "payment_date",
        parse: parseOptionalDate,
        fallback: undefined,
      },
      {
        label: "Principal",
        key: "principal",
        align: "right",
        format: "number",
        parse: parseRequiredNumber,
        fallback: undefined,
      },
      {
        label: "Interest",
        key: "interest",
        align: "right",
        format: "number",
        parse: parseRequiredNumber,
        fallback: undefined,
      },
    ];
  }, []);

  // ✅ Load existing server-side rows (edit mode)
  useEffect(() => {
    let alive = true;

    (async () => {
      if (seriesId == null) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await fetchById<DebtService[]>({
          endpoint: getSeriesDebtServiceById(seriesId),
          entityName: "Debt Series Service Schedule",
          mapResponse: (raw) => raw,
        });

        if (!alive) return;

        if (data?.length) {
          setRows(data);
        } else {
          setRows([]);
        }
      } finally {
        if (alive) setIsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [seriesId]);

  const handleUpload = useCallback(
    async (file: File) => {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(await file.arrayBuffer());

      const ws = wb.worksheets[0];
      if (!ws) {
        const msg = "No worksheet found in uploaded file.";
        setError([msg]);
        return;
      }

      const parseErrors: ParseError[] = [];
      const parsed: DebtServiceUploadRow[] = [];

      // ✅ Efficient scan (faster than ws.eachRow callbacks)
      const sheetValues = ws.getSheetValues() as unknown[][];

      for (let r = 2; r < sheetValues.length; r++) {
        const row = sheetValues[r];
        if (!row) continue;

        // Skip blank rows across our defined columns
        const relevantCells = COLUMNS.map((_, idx) => row[idx + 1]);
        const isRowBlank = !relevantCells.some((v) => !isBlank(v));
        if (isRowBlank) continue;

        const item: Partial<DebtServiceUploadRow> = {};

        for (let c = 0; c < COLUMNS.length; c++) {
          const col = COLUMNS[c];
          const raw = row[c + 1]; // ExcelJS row arrays start at col index 1

          if (!col.parse) {
            (item as any)[col.key] = raw;
          } else {
            (item as any)[col.key] = tryParse(
              r,
              String(col.key),
              raw,
              col.parse as any,
              col.fallback as any,
              parseErrors,
            );
          }
        }

        // If your DebtService model includes series_id and you want it set on insert,
        // you can attach it safely without depending on TS knowing the field:
        if (seriesId != null) {
          (item as any).series_id = seriesId;
        }

        parsed.push(item as DebtServiceUploadRow);
      }

      // ✅ Build user-facing parse errors
      const parseErrorLines =
        parseErrors.length > 0
          ? parseErrors.map(
              (e) =>
                `Row ${e.rowIndex}, ${e.field}: ${e.message}` +
                (e.rawValue !== undefined
                  ? ` (value: ${String(e.rawValue)})`
                  : ""),
            )
          : [];

      // ✅ If your validator requires id:number, normalize ONLY for validation
      // while keeping actual parsed id as undefined for inserts.
      const rowsForValidation = parsed.map((r) => ({
        ...r,
        id: (r.id ?? 0) as any, // sentinel only for validator compatibility
      })) as any;

      const validation = validateDebtServiceBatch(rowsForValidation);
      const validationLines = validation.valid ? [] : validation.errors;

      const allErrors = [...parseErrorLines, ...validationLines];

      if (allErrors.length) {
        setError(allErrors);
        return;
      }

      // ✅ Success — keep id undefined in actual data for inserts
      const finalRows = parsed as unknown as DebtService[];

      setError(null);
      setRows(finalRows);
    },
    [COLUMNS, seriesId],
  );

  const handleDownload = useCallback(() => {
    downloadExcelTemplate(
      "DebtServiceTemplate.xlsx",
      "Debt Service",
      COLUMNS.map((c) => c.label),
      rows.map((r) => COLUMNS.map((c) => (r as any)[c.key])),
    );
  }, [COLUMNS, rows]);

  return (
    <div className="space-y-8">
      {/* Title */}
      <h3 className="text-gray-700 text-3xl font-semibold">
        Debt Service Upload
      </h3>
      <div className="mt-2 w-full h-1 bg-gray-300 rounded-full" />

      {/* Upload Bar */}
      <div className="mt-4">
        <UploadBar onUpload={handleUpload} onDownload={handleDownload} />
      </div>

      {/* Errors */}
      {error && (
        <div className="mt-6 p-4 rounded-xl bg-red-100 border border-red-300 text-red-700 shadow-sm">
          <strong className="block mb-1">Upload Errors:</strong>
          <ul className="list-disc ml-6 space-y-1">
            {error.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Table / Empty / Loading */}
      {isLoading ? (
        <SkeletonTable columnCount={COLUMNS.length} rowCount={6} />
      ) : rows.length === 0 ? (
        <div className="mt-6 p-4 rounded-xl bg-yellow-100 border border-yellow-300 text-yellow-700 shadow-sm">
          No data uploaded yet. Please use the upload bar above to add debt
          service entries.
        </div>
      ) : (
        <div className="mt-6">
          <DataTable columns={COLUMNS as any} rows={rows} />
        </div>
      )}
    </div>
  );
};

export default DebtServiceUpload;
