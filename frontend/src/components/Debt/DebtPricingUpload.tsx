import React, { useCallback, useEffect, useMemo, useState } from "react";
import ExcelJS from "exceljs";
import {
  downloadExcelTemplate,
  excelDateToJSONString,
  excelNumberToJSONNumber,
} from "../../utils/func";
import { validateDebtPricingBatch } from "../../utils/validate";
import { DebtPricing, getSeriesPricingById } from "../../Constants/Constants";
import { DataTable } from "../Widgets/DataTable";
import { UploadBar } from "../Widgets/UploadBar";
import { fetchById } from "../../utils/api";
import { SkeletonTable } from "../Widgets/SkeletonTable";
import { useParams } from "react-router-dom";

type ParseError = {
  rowIndex: number; // Excel row number (1-based)
  field: keyof DebtPricing | string;
  message: string;
  rawValue?: unknown;
};

// Allow blank id during upload for inserts
type DebtPricingUploadRow = Omit<DebtPricing, "id"> & { id?: number };

type ColumnDef<K extends keyof DebtPricingUploadRow> = {
  label: string;
  key: K;
  align?: "right";
  format?: "number" | "m/dd/yyyy";
  parse?: (raw: unknown) => DebtPricingUploadRow[K];
  fallback?: DebtPricingUploadRow[K];
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

const DebtPricingUpload: React.FC = () => {
  const { seriesIdParam } = useParams<{ seriesIdParam?: string }>();
  const seriesId = seriesIdParam ? Number(seriesIdParam) : undefined;

  const [rows, setRows] = useState<DebtPricing[]>([]);
  const [error, setError] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Single source of truth (labels, table, export, parsing)
  const COLUMNS = useMemo<ColumnDef<keyof DebtPricingUploadRow>[]>(() => {
    const parseOptionalNumber = (raw: unknown) => {
      if (isBlank(raw)) return undefined; // ✅ allow inserts
      return excelNumberToJSONNumber(raw) as any;
    };

    const parseOptionalDate = (raw: unknown) => {
      if (isBlank(raw)) return undefined;
      return excelDateToJSONString(raw) as any;
    };

    const parseRequiredNumber = (raw: unknown) => {
      // for numeric columns, treat blank as undefined too (lets validator decide)
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
        label: "Maturity Date",
        key: "maturity_date",
        format: "m/dd/yyyy",
        parse: parseOptionalDate,
        fallback: undefined,
      },

      {
        label: "Amount",
        key: "amount",
        align: "right",
        format: "number",
        parse: parseRequiredNumber,
        fallback: undefined,
      },
      {
        label: "Coupon Rate",
        key: "coupon_rate",
        align: "right",
        format: "number",
        parse: parseRequiredNumber,
        fallback: undefined,
      },
      {
        label: "Yield Rate",
        key: "yield_rate",
        align: "right",
        format: "number",
        parse: parseRequiredNumber,
        fallback: undefined,
      },
      {
        label: "Price",
        key: "price",
        align: "right",
        format: "number",
        parse: parseRequiredNumber,
        fallback: undefined,
      },
      {
        label: "Premium/Discount",
        key: "premium_discount",
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
        const data = await fetchById<DebtPricing[]>({
          endpoint: getSeriesPricingById(seriesId),
          entityName: "Debt Series Pricing",
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
  }, []);

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
      const parsed: DebtPricingUploadRow[] = [];

      const sheetValues = ws.getSheetValues() as unknown[][];

      for (let r = 2; r < sheetValues.length; r++) {
        const row = sheetValues[r];
        if (!row) continue;

        // Skip blank rows across our columns
        const relevantCells = COLUMNS.map((_, idx) => row[idx + 1]);
        const isRowBlank = !relevantCells.some((v) => !isBlank(v));
        if (isRowBlank) continue;

        const item: Partial<DebtPricingUploadRow> = {
          series_id: seriesId as any, // keep consistent with your original behavior
        };

        for (let c = 0; c < COLUMNS.length; c++) {
          const col = COLUMNS[c];
          const raw = row[c + 1];

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

        parsed.push(item as DebtPricingUploadRow);
      }

      // Convert parse errors to displayable strings
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

      // ✅ Validation: if your validator expects id:number, normalize only for validation
      // (does NOT change what you store/submit for inserts)
      const rowsForValidation = parsed.map((r) => ({
        ...r,
        id: (r.id ?? 0) as any, // sentinel only for validation if needed
      })) as any;

      const validation = validateDebtPricingBatch(rowsForValidation);
      const validationLines = validation.valid ? [] : validation.errors;

      const allErrors = [...parseErrorLines, ...validationLines];

      if (allErrors.length) {
        setError(allErrors);
        return;
      }

      // ✅ Success — keep id undefined for inserts
      const finalRows = parsed as unknown as DebtPricing[];

      setError(null);
      setRows(finalRows);
    },
    [COLUMNS, seriesId],
  );

  const handleDownload = useCallback(() => {
    downloadExcelTemplate(
      "DebtPricingTemplate.xlsx",
      "Debt Pricing",
      COLUMNS.map((c) => c.label),
      rows.map((r) => COLUMNS.map((c) => (r as any)[c.key])),
    );
  }, [COLUMNS, rows]);

  return (
    <div className="space-y-8">
      <h3 className="text-gray-700 text-3xl font-semibold">
        Debt Pricing Upload
      </h3>
      <div className="mt-2 w-full h-1 bg-gray-300 rounded-full" />

      <div className="mt-4">
        <UploadBar onUpload={handleUpload} onDownload={handleDownload} />
      </div>

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

export default DebtPricingUpload;
