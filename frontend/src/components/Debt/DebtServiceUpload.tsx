import React, { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import { downloadExcelTemplate, excelDateToJSONString } from "../utils/func";
import { DebtService } from "../Constants/Constants";
import { DataTable } from "../Widgets/DataTable";
import { UploadBar } from "../Widgets/UploadBar";
import { validateDebtServiceBatch } from "../utils/validate";
import { fetchById } from "../utils/api";
import { getSeriesDebtServiceById } from "../Constants/Constants";

interface Props {
  seriesId: number | null;
  onChange: (rows: DebtService[]) => void;
  onInitialLoad: (rows: DebtService[]) => void;
  onValidate(results: { valid: boolean; errors: string[] }): void;
}

// ✅ Single source of truth — drives headers, table, and Excel export
const COLUMNS: {
  label: string;
  key: keyof DebtService;
  align?: "right";
  format?: "number";
}[] = [
  { label: "Id", key: "id" },
  { label: "Payment Date", key: "payment_date" },

  // numeric columns (with formatting)
  { label: "Principal", key: "principal", align: "right", format: "number" },
  { label: "Interest", key: "interest", align: "right", format: "number" },
];

const DebtServiceUpload: React.FC<Props> = ({
  seriesId,
  onChange,
  onInitialLoad,
  onValidate,
}) => {
  const [rows, setRows] = useState<DebtService[]>([]);
  const [error, setError] = useState<string[] | null>(null);

  // Load existing server-side rows
  useEffect(() => {
    if (seriesId === null) return;
    fetchById<DebtService[]>({
      endpoint: getSeriesDebtServiceById(seriesId),
      entityName: "Debt Series Service Schedule",
      mapResponse: (raw) => raw,
    }).then((data) => {
      if (data.length > 0) {
        setRows(data);
        onInitialLoad(data);
        onChange(data);
      }
    });
  }, [seriesId]);

  const handleUpload = async (file: File) => {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await file.arrayBuffer());
    const ws = wb.worksheets[0];

    const parsed: DebtService[] = [];

    ws.eachRow?.((row, idx) => {
      if (idx === 1) return; // skip header

      const vals = (row.values as any[]).slice(1);

      // Skip blank Excel rows (fixes silent failures)
      if (!vals.some((v) => v !== null && v !== undefined && v !== "")) return;

      // Build an entry using the same pattern as DebtPricing
      const entry = Object.fromEntries(
        COLUMNS.map(({ key }, i) => [key, vals[i]]),
      );

      parsed.push({
        id: entry.id,
        payment_date: excelDateToJSONString(entry.payment_date),
        principal: Number(entry.principal),
        interest: Number(entry.interest),
      } as DebtService);
    });

    // Validate against existing store rows
    const validation = validateDebtServiceBatch(parsed);

    if (!validation.valid) {
      setError(validation.errors); // ❌ show validation errors (array)
      return;
    }

    // SUCCESS
    setError(null); // clear errors
    setRows(parsed); // update table
    onChange(parsed); // notify parent
  };

  const handleDownload = () => {
    downloadExcelTemplate(
      "DebtServiceTemplate.xlsx",
      "Debt Service",
      COLUMNS.map((c) => c.label),
      rows.map((r) => COLUMNS.map((c) => r[c.key])),
    );
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <h3 className="text-gray-700 text-3xl font-semibold">
        Debt Service Upload
      </h3>
      <div className="mt-2 w-full h-1 bg-gray-300 rounded-full"></div>

      {/* Beautiful Spaced Upload Bar */}
      <div className="mt-4">
        <UploadBar
          onUpload={(file) => handleUpload(file)}
          onDownload={handleDownload}
        />
      </div>

      {/* Spaced Error Box */}
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

      {/* Table With Nice Top Spacing */}
      {rows.length > 0 && (
        <div className="mt-6">
          <DataTable columns={COLUMNS} rows={rows} />
        </div>
      )}
    </div>
  );
};

export default DebtServiceUpload;
