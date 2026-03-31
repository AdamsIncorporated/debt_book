import React, { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import { downloadExcelTemplate, validateDebtServiceBatch } from "../utils/func";
import { DebtService } from "components/Constants/Constants";
import { DataTable } from "../Widgets/DataTable";
import { UploadBar } from "../Widgets/UploadBar";

interface Props {
  seriesId: number;
  onChange: (rows: DebtService[]) => void;
  onInitialLoad: (rows: DebtService[]) => void;
}

// ✅ Single source of truth — drives headers, table, and Excel export
const COLUMNS: {
  label: string;
  key: keyof DebtService;
  align?: "right";
  format?: "number";
}[] = [
  { label: "Id", key: "id" },
  { label: "Series Id", key: "series_id" },
  { label: "Payment Date", key: "payment_date" },

  // numeric columns (with formatting)
  { label: "Principal", key: "principal", align: "right", format: "number" },
  { label: "Interest", key: "interest", align: "right", format: "number" },
];
``;

async function fetchDebtService(seriesId: number): Promise<DebtService[]> {
  try {
    const res = await fetch(
      `api/get/get_debt_series_service_by_id/${seriesId}`,
    );
    const data = await res.json();

    return data.map((item: any) => ({
      id: item.id ?? null,
      series_id: item.series_id,
      payment_date: item.payment_date,
      principal: Number(item.principal ?? 0),
      interest: Number(item.interest ?? 0),
    }));
  } catch {
    return [];
  }
}

const DebtServiceUpload: React.FC<Props> = ({
  seriesId,
  onChange,
  onInitialLoad,
}) => {
  const [rows, setRows] = useState<DebtService[]>([]);
  const [error, setError] = useState<string[] | null>(null);

  // Load existing server-side rows
  useEffect(() => {
    fetchDebtService(seriesId).then((data) => {
      if (data.length > 0) {
        setRows(data);
        onInitialLoad(data);
        onChange(data);
      }
    });
  }, [seriesId]);

  const handleUpload = async (file: File, store: DebtService[]) => {
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
        id: entry.id ? Number(entry.id) : null,
        series_id: entry.series_id ? Number(entry.series_id) : seriesId,
        payment_date: entry.payment_date?.toString(),
        principal: Number(entry.principal ?? 0),
        interest: Number(entry.interest ?? 0),
      });
    });

    // Validate against existing store rows
    const validation = validateDebtServiceBatch(parsed, store);

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
      <h3 className="text-lg font-semibold">Debt Pricing Upload</h3>

      {/* Beautiful Spaced Upload Bar */}
      <div className="mt-4">
        <UploadBar
          onUpload={(file) => handleUpload(file, rows)}
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
