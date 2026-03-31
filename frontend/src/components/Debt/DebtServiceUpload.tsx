import React, { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import { downloadExcelTemplate, validateDebtServiceBatch } from "../utils/func";
import { DebtService } from "components/Constants/Constants";

interface Props {
  seriesId: number;
  onChange: (rows: DebtService[]) => void;
  onInitialLoad: (rows: DebtService[]) => void;
}

// ✅ Single source of truth — drives headers, table, and Excel export
const COLUMNS: { label: string; key: keyof DebtService; align?: "right" }[] = [
  { label: "Id", key: "id" },
  { label: "Series Id", key: "series_id" },
  { label: "Payment Date", key: "payment_date" },
  { label: "Principal", key: "principal", align: "right" },
  { label: "Interest", key: "interest", align: "right" },
];

async function fetchDebtService(seriesId: number): Promise<DebtService[]> {
  try {
    const res = await fetch(
      `http://localhost:5000/get/get_debt_series_service_by_id/${seriesId}`,
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Debt Service Upload</h3>

      {/* Upload Button Row */}
      <label className="inline-flex w-full items-center gap-3 px-4 py-2 rounded-xl bg-white text-gray font-medium shadow-md cursor-pointer hover:bg-gray-100 active:scale-95 transition">
        📄 Upload Excel Debt Service Schedule
        <input
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f, rows);
          }}
        />
        <button
          onClick={handleDownload}
          className="px-4 py-2 rounded-xl bg-white text-gray font-medium shadow-md hover:bg-gray-100 active:scale-95 transition cursor-pointer"
        >
          ⬇️ Download Template
        </button>
      </label>

      {/* Error Box (identical to Debt Pricing UI) */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-100 border border-red-300 text-red-700 shadow-sm">
          <strong className="block mb-1">Upload Errors:</strong>
          <ul className="list-disc ml-6 space-y-1">
            {error.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Table */}
      {rows.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-xl shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                {COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    className={`px-3 py-2 ${
                      c.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t">
                  {COLUMNS.map((c) => (
                    <td
                      key={c.key}
                      className={`px-3 py-2 ${
                        c.align === "right" ? "text-right" : ""
                      }`}
                    >
                      {typeof row[c.key] === "number"
                        ? (row[c.key] as number).toFixed(2)
                        : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DebtServiceUpload;
