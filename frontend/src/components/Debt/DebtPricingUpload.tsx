import React, { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import { downloadExcelTemplate, validateDebtPricingBatch } from "../utils/func";
import { DebtPricing } from "../Constants/Constants";
import { DataTable } from "../Widgets/DataTable";
import { UploadBar } from "../Widgets/UploadBar";
import { fetchById } from "../utils/api";
import { getSeriesPricingById } from "../Constants/Constants";

interface Props {
  seriesId: number | null;
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

const DebtPricingUpload: React.FC<Props> = ({
  seriesId,
  onChange,
  onInitialLoad,
}) => {
  const [rows, setRows] = useState<DebtPricing[]>([]);
  const [error, setError] = useState<string[] | null>(null);

  useEffect(() => {
    if (seriesId === null) return;
    fetchById<DebtPricing[]>({
      endpoint: getSeriesPricingById(seriesId),
      entityName: "Debt Series Pricing",
      mapResponse: (raw) => raw,
    }).then((data) => {
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
    <div className="space-y-8">
      {/* Title */}
      <h3 className="text-gray-700 text-3xl font-semibold">
        Debt Pricing Upload
      </h3>
      <div className="mt-2 w-full h-1 bg-gray-300 rounded-full"></div>

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

export default DebtPricingUpload;
