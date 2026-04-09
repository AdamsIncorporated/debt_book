import React, { useState, useEffect } from "react";
import { DebtSeries } from "../Constants/Constants";
import { fetchById } from "../utils/api";
import { validateDebtSeries } from "components/utils/validate";
import { formatNumber } from "../utils/func";

type Props = {
  seriesId: number | null;
  parSum: number | null;
  oidSum: number | null;
  onChange: (v: DebtSeries) => void;
  onInitialLoad: (v: any) => void;
  onValidate(results: { valid: boolean; errors: string[] }): void;
};

const DebtSeriesForm: React.FC<Props> = ({
  seriesId,
  parSum,
  oidSum,
  onChange,
  onInitialLoad,
}) => {
  const [form, setForm] = useState({
    id: 0,
    seriesName: "",
    isTaxExempt: false,
    parAmount: parSum != null ? String(parSum) : "",
    premium: oidSum != null ? String(oidSum) : "",
    costOfIssuance: "",
  });

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (seriesId === null) {
      setLoaded(true);
      return;
    }

    setLoaded(false);

    fetchById({
      endpoint: `/api/get/get_debt_series_by_id/${seriesId}`,
      entityName: "Debt Series",
      mapResponse: (raw: any) => ({
        id: raw.id,
        series_name: raw.series_name ?? "",
        is_tax_exempt: raw.is_tax_exempt ?? 0,
        par_amount: raw.par_amount ?? 0,
        premium: raw.premium ?? 0,
        cost_of_issuance: raw.cost_of_issuance ?? 0,
      }),
    })
      .then((data: any) => {
        setForm({
          id: data.id ?? 0,
          seriesName: data.series_name ?? "",
          isTaxExempt: data.is_tax_exempt === 1,
          parAmount: data.par_amount?.toString() ?? "",
          premium: data.premium?.toString() ?? "",
          costOfIssuance: data.cost_of_issuance?.toString() ?? "",
        });

        onInitialLoad(data);
      })
      .finally(() => setLoaded(true));
  }, [seriesId, onInitialLoad]);

  const handleChange = (updated: typeof form) => {
    setForm(updated);

    if (updated.seriesName && Number(updated.parAmount) > 0) {
      onChange({
        id: updated.id || null,
        series_name: updated.seriesName,
        is_tax_exempt: Number(updated.isTaxExempt),
        par_amount: Number(updated.parAmount),
        premium: Number(updated.premium || 0),
        cost_of_issuance: Number(updated.costOfIssuance || 0),
      });
    }
  };

  /* ✅ Skeleton loader preserved */
  if (!loaded) {
    return (
      <div className="space-y-4 max-w-md p-6 bg-white rounded-2xl shadow-lg animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded-md" />
        <div className="h-10 w-full bg-gray-200 rounded-lg" />
        <div className="h-10 w-full bg-gray-200 rounded-lg" />
        <div className="h-10 w-full bg-gray-200 rounded-lg" />
        <div className="h-10 w-full bg-gray-200 rounded-lg" />
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 bg-white rounded-2xl shadow-lg">
      <label className="text-sm font-medium text-gray-800">Series Name</label>
      <input
        type="text"
        value={form.seriesName}
        onChange={(e) => handleChange({ ...form, seriesName: e.target.value })}
        className="w-full px-4 py-2 rounded-lg shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-800">Par Amount</label>
        <div className="w-full px-4 py-2 rounded-lg shadow-sm bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {formatNumber(form.parAmount)}
        </div>

        <label className="text-sm font-medium text-gray-800">Premium</label>
        <div className="w-full px-4 py-2 rounded-lg shadow-sm bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {formatNumber(form.premium)}
        </div>
      </div>

      <label className="text-sm font-medium text-gray-800">
        Cost of Issuance
      </label>
      <input
        type="number"
        value={form.costOfIssuance}
        onChange={(e) =>
          handleChange({ ...form, costOfIssuance: e.target.value })
        }
        className="w-full px-4 py-2 rounded-lg shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.isTaxExempt}
          onChange={(e) =>
            handleChange({ ...form, isTaxExempt: e.target.checked })
          }
        />
        Tax Exempt
      </label>
    </div>
  );
};

export default DebtSeriesForm;
