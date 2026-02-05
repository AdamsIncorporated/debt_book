import React, { useState } from "react";
import ExcelJS from "exceljs";
import { downloadExcelTemplate } from "../utils/func";

export interface DebtServiceRow {
  paymentDate: string;
  principal: number;
  interest: number;
}

interface Props {
  onChange: (rows: DebtServiceRow[]) => void;
}

const DebtServiceUpload: React.FC<Props> = ({ onChange }) => {
  const [rows, setRows] = useState<DebtServiceRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      const ws = workbook.worksheets[0];

      const parsed: DebtServiceRow[] = [];

      ws.eachRow?.((row, idx) => {
        if (idx === 1) return; // header

        const [paymentDate, principal, interest] = (row.values as any[]).slice(
          1,
        );

        if (!paymentDate) return;

        parsed.push({
          paymentDate: paymentDate.toString(),
          principal: Number(principal || 0),
          interest: Number(interest || 0),
        });
      });

      // ---- Validation ----
      if (parsed.length === 0) {
        throw new Error("No valid rows found");
      }

      parsed.forEach((r, i) => {
        if (!r.paymentDate)
          throw new Error(`Row ${i + 2}: missing payment date`);
        if (r.principal < 0) throw new Error(`Row ${i + 2}: principal < 0`);
        if (r.interest < 0) throw new Error(`Row ${i + 2}: interest < 0`);
      });

      setRows(parsed);
      onChange(parsed);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setRows([]);
      onChange([]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Debt Service Upload</h3>

      <label className="inline-flex w-full items-center gap-3 px-4 py-2 rounded-xl bg-white text-gray font-medium shadow-md cursor-pointer hover:bg-gray-100 active:scale-95 transition">
        📄 Upload Excel Debt Service Schedule
        <input
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            handleUpload(file);
          }}
        />
        <button
          onClick={() =>
            downloadExcelTemplate("DebtServiceTemplate.xlsx", "Debt Service", [
              "Payment Date",
              "Principal",
              "Interest",
            ])
          }
          className="px-4 py-2 rounded-xl bg-white text-gray font-medium shadow-md hover:bg-gray-100 active:scale-95 transition cursor-pointer"
        >
          ⬇️ Download Template
        </button>
      </label>

      {error && <p className="text-red-500">{error}</p>}

      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border px-3 py-2">Payment Date</th>
                <th className="border px-3 py-2">Principal</th>
                <th className="border px-3 py-2">Interest</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="border px-3 py-2">{r.paymentDate}</td>
                  <td className="border px-3 py-2">{r.principal.toFixed(2)}</td>
                  <td className="border px-3 py-2">{r.interest.toFixed(2)}</td>
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
