import React, { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import {
  downloadExcelTemplate,
  validateDebtPricingBatch,
  formatNumber,
} from "../utils/func";
import { DebtPricing } from "../Constants/Constants";

interface Props {
  seriesId: number;
  onChange: (v: DebtPricing[]) => void;
  onInitialLoad: (v: DebtPricing[]) => void;
}

// ✅ Single source of truth — drives headers, table, and Excel export
const COLUMNS: {
  label: string;
  key: keyof DebtPricing;
  align?: "right";
  format?: "number";
}[] = [
  { label: "Id", key: "id" },
  { label: "Series Id", key: "series_id" },
  { label: "Maturity Date", key: "maturity_date" },

  // numeric columns (add format: "number")
  { label: "Amount", key: "amount", align: "right", format: "number" },
  {
    label: "Coupon Rate",
    key: "coupon_rate",
    align: "right",
    format: "number",
  },
  { label: "Yield Rate", key: "yield_rate", align: "right", format: "number" },
  { label: "Price", key: "price", align: "right", format: "number" },
  {
    label: "Premium/Discount",
    key: "premium_discount",
    align: "right",
    format: "number",
  },
];

async function fetchDebtPricing(seriesId: number): Promise<DebtPricing[]> {
  try {
    const res = await fetch(
      `http://localhost:5000/get/get_debt_series_pricing_by_id/${seriesId}`,
    );
    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id,
      series_id: item.series_id,
      maturity_date: item.maturity_date,
      amount: Number(item.amount),
      coupon_rate: Number(item.coupon_rate),
      yield_rate: Number(item.yield_rate),
      price: Number(item.price),
      premium_discount: Number(item.premium_discount),
    }));
  } catch {
    return [];
  }
}

const DebtPricingUpload: React.FC<Props> = ({
  seriesId,
  onChange,
  onInitialLoad,
}) => {
  const [rows, setRows] = useState<DebtPricing[]>([]);
  const [error, setError] = useState<string[] | null>(null);

  useEffect(() => {
    fetchDebtPricing(seriesId).then((data) => {
      if (data.length > 0) {
        setRows(data);
        onInitialLoad(data);
        onChange(data);
      }
    });
  }, [seriesId]);

  const handleUpload = async (file: File, store: DebtPricing[]) => {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await file.arrayBuffer());
    const ws = wb.worksheets[0];

    const parsed: DebtPricing[] = [];

    ws.eachRow?.((row, idx) => {
      if (idx === 1) return; // skip header

      const vals = (row.values as any[]).slice(1);
      const entry = Object.fromEntries(
        COLUMNS.map(({ key }, i) => [key, vals[i]]),
      );

      parsed.push({
        ...entry,
        id: Number(entry.id),
        series_id: Number(entry.series_id),
        amount: Number(entry.amount),
        coupon_rate: Number(entry.coupon_rate),
        yield_rate: Number(entry.yield_rate),
        price: Number(entry.price),
        premium_discount: Number(entry.premium_discount),
      } as DebtPricing);
    });

    // Validate against existing rows (server-loaded store)
    const validation = validateDebtPricingBatch(parsed, store);

    if (!validation.valid) {
      setError(validation.errors); // ❌ show validation errors
      return;
    } else {
      console.log("Validation passed, parsed data:", parsed); // ✅ log parsed data
    }

    setError(null); // ✅ clear previous errors
    setRows(parsed);
    onChange(parsed);
  };

  const handleDownload = () =>
    downloadExcelTemplate(
      "DebtPricingTemplate.xlsx",
      "Debt Pricing",
      COLUMNS.map((c) => c.label),
      rows.map((r) => COLUMNS.map((c) => r[c.key])),
    );

  return (
    <div>
      <h3 className="text-lg font-semibold">Debt Pricing Upload</h3>

      {/* Upload Button Row */}
      <label className="inline-flex w-full items-center gap-3 px-4 py-2 rounded-xl bg-white text-gray font-medium shadow-md cursor-pointer hover:bg-gray-100 active:scale-95 transition">
        📄 Upload Excel Pricing Schedule
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

      {/* Error Box (clean, separate, seamless) */}
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
                      {c.format === "number"
                        ? formatNumber(row[c.key])
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

export default DebtPricingUpload;
