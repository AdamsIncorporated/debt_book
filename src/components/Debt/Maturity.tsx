import React, { useState } from "react";
import * as XLSX from "xlsx";

export interface MaturityRow {
  maturityDate: string;
  amount: string;
  rate: string;
  yield: string;
  price: string;
}

interface DebtMaturityFormProps {
  onNext: () => void;
  onBack: () => void;
  onSubmitData?: (rows: MaturityRow[]) => void; // optional for backend submission
}

const MaturityForm: React.FC<DebtMaturityFormProps> = ({ onNext, onBack, onSubmitData }) => {
  const [data, setData] = useState<MaturityRow[]>([]);

  // Download Excel template
  const handleDownloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      { maturityDate: "YYYY-MM-DD", amount: 0, rate: 0, yield: 0, price: 0 },
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MaturityTemplate");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DebtMaturityTemplate.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Upload Excel file
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData: MaturityRow[] = XLSX.utils.sheet_to_json(ws);
      setData(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmitData = () => {
    if (onSubmitData) {
      onSubmitData(data);
    }
    onNext();
  };

  return (
    <div className="p-4 bg-sky-950 rounded-xl shadow-md w-full max-w-4xl mx-auto">
      <h2 className="mb-6 text-xl font-semibold text-white">Debt Maturity Form</h2>

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
                <th className="border border-sky-700 px-4 py-2">Maturity Date</th>
                <th className="border border-sky-700 px-4 py-2">Amount</th>
                <th className="border border-sky-700 px-4 py-2">Rate</th>
                <th className="border border-sky-700 px-4 py-2">Yield</th>
                <th className="border border-sky-700 px-4 py-2">Price</th>
              </tr>
            </thead>
            <tbody className="bg-sky-950/40 text-white">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-sky-900">
                  <td className="border border-sky-700 px-4 py-2">{row.maturityDate}</td>
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

export default MaturityForm;
