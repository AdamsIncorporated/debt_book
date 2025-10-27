import React, { useState } from "react";
import ExcelJS from "exceljs";

export interface DebtServiceRow {
  periodEndDate: string;
  principal: string;
  coupon: string;
  interest: string;
  debtService: string;
}

interface DebtServiceFormProps {
  onNext: () => void;
  onBack: () => void;
  onSubmitData?: (rows: DebtServiceRow[]) => void;
}

const DebtServiceForm: React.FC<DebtServiceFormProps> = ({ onNext, onBack, onSubmitData }) => {
  const [data, setData] = useState<DebtServiceRow[]>([]);

  // Download Excel template
  const handleDownloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("DebtServiceTemplate");

    worksheet.columns = [
      { header: "Period End Date", key: "periodEndDate" },
      { header: "Principal", key: "principal" },
      { header: "Coupon", key: "coupon" },
      { header: "Interest", key: "interest" },
      { header: "Debt Service", key: "debtService" },
    ];

    worksheet.addRow({
      periodEndDate: "YYYY-MM-DD",
      principal: "0",
      coupon: "0",
      interest: "0",
      debtService: "0",
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "DebtServiceTemplate.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Upload Excel file
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const worksheet = workbook.worksheets[0];

    const rows: DebtServiceRow[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const rowValues = row.values as (string | number | undefined)[];
      const [periodEndDate, principal, coupon, interest, debtService] = rowValues.slice(1);
      rows.push({
        periodEndDate: periodEndDate?.toString() || "",
        principal: principal?.toString() || "0",
        coupon: coupon?.toString() || "0",
        interest: interest?.toString() || "0",
        debtService: debtService?.toString() || "0",
      });
    });

    setData(rows);
  };

  const handleSubmitData = () => {
    if (onSubmitData) onSubmitData(data);
    onNext();
  };

  return (
    <div className="p-4 bg-sky-950 rounded-xl shadow-md w-full max-w-4xl mx-auto">
      <h2 className="mb-6 text-xl font-semibold text-white">Debt Service Form</h2>

      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="rounded-lg bg-sky-700 px-4 py-2 text-white font-semibold hover:bg-sky-600 transition-all duration-300"
        >
          Download Template
        </button>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleUpload}
          className="rounded-lg border border-sky-700 bg-sky-950/40 px-4 py-2 text-white cursor-pointer"
        />
      </div>

      {data.length > 0 && (
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full table-auto border border-sky-700">
            <thead className="bg-sky-800 text-white">
              <tr>
                <th className="border border-sky-700 px-4 py-2">Period End Date</th>
                <th className="border border-sky-700 px-4 py-2">Principal</th>
                <th className="border border-sky-700 px-4 py-2">Coupon</th>
                <th className="border border-sky-700 px-4 py-2">Interest</th>
                <th className="border border-sky-700 px-4 py-2">Debt Service</th>
              </tr>
            </thead>
            <tbody className="bg-sky-950/40 text-white">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-sky-900">
                  <td className="border border-sky-700 px-4 py-2">{row.periodEndDate}</td>
                  <td className="border border-sky-700 px-4 py-2">{row.principal}</td>
                  <td className="border border-sky-700 px-4 py-2">{row.coupon}</td>
                  <td className="border border-sky-700 px-4 py-2">{row.interest}</td>
                  <td className="border border-sky-700 px-4 py-2">{row.debtService}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-lg border border-sky-700 bg-sky-800 px-4 py-2 text-white font-semibold transition-all duration-300 hover:bg-sky-700"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmitData}
          className="flex-1 rounded-lg bg-sky-700 px-4 py-2 text-white font-semibold transition-all duration-300 hover:bg-sky-600 active:bg-sky-800 focus:ring-2 focus:ring-sky-500"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DebtServiceForm;
