import React, { useState } from "react";
import ExcelJS from "exceljs";
import ThemeNavButton from "../Form/ThemeNavButton";


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

  const handleSubmit = () => {
    if (onSubmitData) onSubmitData(data);
    onNext();
  };

  return (
    <div className="p-4 shadow-md w-full max-w-4xl mx-auto">
      <h2 className="mb-6 text-xl font-semibold">Debt Service Form</h2>

      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="px-4 py-2 font-semibold hover:bg-sky-600 transition-all duration-300"
        >
          Download Template
        </button>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleUpload}
          className="border px-4 py-2 cursor-pointer"
        />
      </div>

      {data.length > 0 && (
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full table-auto border border-sky-700">
            <thead className="bg-sky-800">
              <tr>
                <th className="border border-sky-700 px-4 py-2">Period End Date</th>
                <th className="border border-sky-700 px-4 py-2">Principal</th>
                <th className="border border-sky-700 px-4 py-2">Coupon</th>
                <th className="border border-sky-700 px-4 py-2">Interest</th>
                <th className="border border-sky-700 px-4 py-2">Debt Service</th>
              </tr>
            </thead>
            <tbody className="bg-sky-950/40">
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
      <div className="my-2">
        <ThemeNavButton onBack={onBack} onNext={handleSubmit} />
      </div>
    </div>
  );
};

export default DebtServiceForm;
