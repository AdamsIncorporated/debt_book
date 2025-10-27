import React, { useState } from "react";
import ExcelJS from "exceljs";

export interface DebtMaturity {
  id?: number;
  maturity_date: string;
  amount: number;
  rate: number;
  yield: number;
  price: number;
  created_at?: string;
}

interface DebtMaturityFormProps {
  onNext: () => void;
  onBack: () => void;
  onSubmitData?: (rows: DebtMaturity[]) => void;
}

const MaturityForm: React.FC<DebtMaturityFormProps> = ({ onNext, onBack, onSubmitData }) => {
  const [data, setData] = useState<DebtMaturity[]>([]);

  // Download template
  const handleDownloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("MaturityTemplate");

    worksheet.columns = [
      { header: "Maturity Date", key: "maturity_date" },
      { header: "Amount", key: "amount" },
      { header: "Rate", key: "rate" },
      { header: "Yield", key: "yield" },
      { header: "Price", key: "price" },
    ];

    worksheet.addRow({
      maturity_date: "YYYY-MM-DD",
      amount: 0,
      rate: 0,
      yield: 0,
      price: 0,
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "DebtMaturityTemplate.xlsx";
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

    const rows: DebtMaturity[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const rowValues = row.values as (string | number | undefined)[];
      const [maturity_date, amount, rate, yieldValue, price] = rowValues.slice(1);
      rows.push({
        maturity_date: maturity_date?.toString() || "",
        amount: Number(amount ?? 0),
        rate: Number(rate ?? 0),
        yield: Number(yieldValue ?? 0),
        price: Number(price ?? 0),
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
      <h2 className="mb-6 text-xl font-semibold">Debt Maturity Form</h2>

      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="rounded-lg bg-sky-700 px-4 py-2 font-semibold hover:bg-sky-600 transition-all duration-300"
        >
          Download Template
        </button>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleUpload}
          className="rounded-lg border border-sky-700 bg-sky-950/40 px-4 py-2 cursor-pointer"
        />
      </div>

      {data.length > 0 && (
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full table-auto border border-sky-700">
            <thead className="bg-sky-800">
              <tr>
                <th className="border border-sky-700 px-4 py-2">Maturity Date</th>
                <th className="border border-sky-700 px-4 py-2">Amount</th>
                <th className="border border-sky-700 px-4 py-2">Rate</th>
                <th className="border border-sky-700 px-4 py-2">Yield</th>
                <th className="border border-sky-700 px-4 py-2">Price</th>
              </tr>
            </thead>
            <tbody className="bg-sky-950/40">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-sky-900">
                  <td className="border border-sky-700 px-4 py-2">{row.maturity_date}</td>
                  <td className="border border-sky-700 px-4 py-2">{row.amount}</td>
                  <td className="border border-sky-700 px-4 py-2">{row.rate}</td>
                  <td className="border border-sky-700 px-4 py-2">{row.yield}</td>
                  <td className="border border-sky-700 px-4 py-2">{row.price}</td>
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
          className="flex-1 rounded-lg border border-sky-700 bg-sky-800 px-4 py-2 font-semibold transition-all duration-300 hover:bg-sky-700"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmitData}
          className="flex-1 rounded-lg bg-sky-700 px-4 py-2 font-semibold transition-all duration-300 hover:bg-sky-600 active:bg-sky-800 focus:ring-2 focus:ring-sky-500"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MaturityForm;
