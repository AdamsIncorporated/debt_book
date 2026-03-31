import React, { useState, useEffect } from "react";
import { DebtSeries } from "../Constants/Constants";

async function fetchDebtSeriesById(seriesId: number): Promise<DebtSeries> {
  const res = await fetch(`api/get/get_debt_series_by_id/${seriesId}`);
  const data = await res.json();
  return {
    id: data[0].id,
    series_name: data[0].series_name,
    is_tax_exempt: data[0].is_tax_exempt,
    par_amount: data[0].par_amount,
    premium: data[0].premium,
    cost_of_issuance: data[0].cost_of_issuance,
    created_at: data[0].created_at,
  };
}

function DebtSeriesForm({
  seriesId,
  onChange,
  onInitialLoad,
}: {
  seriesId: number;
  onChange: (v: any) => void;
  onInitialLoad: (v: any) => void;
}) {
  const [form, setForm] = useState({
    id: 0,
    seriesName: "",
    isTaxExempt: false,
    parAmount: "",
    premium: "",
    costOfIssuance: "",
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchDebtSeriesById(seriesId)
      .then((data) => {
        setForm({
          id: data.id ?? 0,
          seriesName: data.series_name ?? "",
          isTaxExempt: data.is_tax_exempt == 1,
          parAmount: data.par_amount?.toString() ?? "",
          premium: data.premium?.toString() ?? "",
          costOfIssuance: data.cost_of_issuance?.toString() ?? "",
        });
        setLoaded(true);
        onInitialLoad(data);
      })
      .catch(() => null); // silently fail — form won't show
  }, [seriesId]);

  if (!loaded)
    return (
      <div className="space-y-4 max-w-md p-6 bg-white rounded-2xl shadow-lg animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded-md" /> {/* title */}
        <div className="h-10 w-full bg-gray-200 rounded-lg" />{" "}
        {/* Series Name */}
        <div className="h-10 w-full bg-gray-200 rounded-lg" />{" "}
        {/* Par Amount */}
        <div className="h-10 w-full bg-gray-200 rounded-lg" /> {/* Premium */}
        <div className="h-10 w-full bg-gray-200 rounded-lg" />{" "}
        {/* Cost of Issuance */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 rounded" /> {/* checkbox */}
          <div className="h-4 w-20 bg-gray-200 rounded" />{" "}
          {/* Tax Exempt label */}
        </div>
      </div>
    );

  const handleChange = (updated: typeof form) => {
    setForm(updated);
    if (updated.seriesName && Number(updated.parAmount) > 0) {
      const debtSeries: DebtSeries = {
        id: updated.id ?? null,
        series_name: updated.seriesName,
        is_tax_exempt: Number(updated.isTaxExempt),
        par_amount: Number(updated.parAmount),
        premium: Number(updated.premium || 0),
        cost_of_issuance: Number(updated.costOfIssuance || 0),
      };

      onChange(debtSeries);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Debt Series Form
      </h2>
      <label htmlFor="seriesName">Series Name</label>
      <input
        name="seriesName"
        type="text"
        placeholder="Series Name"
        value={form.seriesName}
        onChange={(e) => handleChange({ ...form, seriesName: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      />
      <label htmlFor="parAmount">Par Amount</label>
      <input
        name="parAmount"
        type="number"
        placeholder="Par Amount"
        value={form.parAmount}
        onChange={(e) => handleChange({ ...form, parAmount: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      />
      <label htmlFor="premium">Premium</label>
      <input
        name="premium"
        type="number"
        placeholder="Premium"
        value={form.premium}
        onChange={(e) => handleChange({ ...form, premium: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      />
      <label htmlFor="costOfIssuance">Cost of Issuance</label>
      <input
        name="costOfIssuance"
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
