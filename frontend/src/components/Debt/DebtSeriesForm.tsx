import React, { useState, useEffect } from "react";

interface SeriesName {
  name: string;
}

async function fetchSeriesNames(): Promise<string[]> {
  try {
    const response = await fetch("http://127.0.0.1:5000/debt/series_names");

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data: SeriesName[] = await response.json();
    return data.map((item) => item.name);
  } catch (error) {
    console.error("Failed to fetch series names:", error);
    return [];
  }
}

const DebtSeriesForm = ({ onChange }: { onChange: (v: any) => void }) => {
  const [existingSeries, setExistingSeries] = useState<string[]>([]);
  const [form, setForm] = useState({
    seriesName: "",
    isTaxExempt: false,
    parAmount: "",
    premium: "",
    costOfIssuance: "",
  });
  const [isUniqueSeries, setIsUniqueSeries] = useState(true);

  // Fetch the series names once on mount
  useEffect(() => {
    fetchSeriesNames().then(setExistingSeries);
  }, []);

  // Validate series name and call onChange whenever form changes
  useEffect(() => {
    // Series is unique if it does NOT exist in existingSeries
    const unique = !existingSeries.includes(form.seriesName);
    setIsUniqueSeries(unique);

    const validForm = unique && Number(form.parAmount) > 0;
    if (validForm) {
      onChange({
        seriesName: form.seriesName,
        isTaxExempt: form.isTaxExempt,
        parAmount: Number(form.parAmount),
        premium: Number(form.premium || 0),
        costOfIssuance: Number(form.costOfIssuance || 0),
      });
    }
  }, [form, existingSeries, onChange]);

  return (
    <div className="space-y-4 max-w-md p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Debt Series Form
      </h2>

      <input
        type="text"
        placeholder="Series Name"
        value={form.seriesName}
        onChange={(e) => setForm({ ...form, seriesName: e.target.value })}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
          isUniqueSeries
            ? "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            : "border-red-500 focus:ring-red-500 focus:border-red-500"
        }`}
      />
      {!isUniqueSeries && (
        <p className="text-red-500 text-sm mt-1">
          This series name already exists. Please choose a unique name.
        </p>
      )}

      <input
        type="number"
        placeholder="Par Amount"
        value={form.parAmount}
        onChange={(e) => setForm({ ...form, parAmount: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      />

      <input
        type="number"
        placeholder="Premium"
        value={form.premium}
        onChange={(e) => setForm({ ...form, premium: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      />

      <input
        type="number"
        placeholder="Cost of Issuance"
        value={form.costOfIssuance}
        onChange={(e) => setForm({ ...form, costOfIssuance: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      />

      <label className="flex items-center gap-2 text-gray-700">
        <input
          type="checkbox"
          checked={form.isTaxExempt}
          onChange={(e) => setForm({ ...form, isTaxExempt: e.target.checked })}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
        />
        Tax Exempt
      </label>
    </div>
  );
};

export default DebtSeriesForm;
