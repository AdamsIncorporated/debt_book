import React, { useState } from "react";
import { DebtSeries } from "../Constants/Get";

function DebtSeriesForm({
  initialData,
  onChange,
}: {
  initialData: DebtSeries;
  onChange: (v: any) => void;
}): React.JSX.Element {
  const [form, setForm] = useState({
    seriesName: initialData.series_name ?? "",
    isTaxExempt: initialData.is_tax_exempt ?? false,
    parAmount: initialData.par_amount?.toString() ?? "",
    premium: initialData.premium?.toString() ?? "",
    costOfIssuance: initialData.cost_of_issuance?.toString() ?? "",
  });

  const handleChange = (updated: typeof form) => {
    setForm(updated);
    if (updated.seriesName && Number(updated.parAmount) > 0) {
      onChange({
        seriesName: updated.seriesName,
        isTaxExempt: updated.isTaxExempt,
        parAmount: Number(updated.parAmount),
        premium: Number(updated.premium || 0),
        costOfIssuance: Number(updated.costOfIssuance || 0),
      });
    }
  };

  return (
    <div className="space-y-4 max-w-md p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Debt Series Form
      </h2>
      <input
        type="text"
        placeholder="Series Name"
        value={form.seriesName}
        onChange={(e) => handleChange({ ...form, seriesName: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      />
      <input
        type="number"
        placeholder="Par Amount"
        disabled={true}
        value={form.parAmount}
        onChange={(e) => handleChange({ ...form, parAmount: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      />
      <input
        type="number"
        placeholder="Premium"
        value={form.premium}
        onChange={(e) => handleChange({ ...form, premium: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      />
      <input
        type="number"
        placeholder="Cost of Issuance"
        value={form.costOfIssuance}
        onChange={(e) =>
          handleChange({ ...form, costOfIssuance: e.target.value })
        }
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      />
      <label className="flex items-center gap-2 text-gray-700">
        <input
          type="checkbox"
          checked={form.isTaxExempt}
          onChange={(e) =>
            handleChange({ ...form, isTaxExempt: e.target.checked })
          }
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
        />
        Tax Exempt
      </label>
    </div>
  );
}

export default DebtSeriesForm;
