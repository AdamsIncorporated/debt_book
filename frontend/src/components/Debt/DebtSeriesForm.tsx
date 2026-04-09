import React, { useState, useEffect } from "react";
import { DebtSeries } from "../Constants/Constants";
import { fetchById } from "../utils/api";
import { validateDebtSeries } from "../utils/validate";
import { formatNumber } from "../utils/func";
import { ReadOnlyField } from "../Widgets/ReadOnlyField";
import DebtSeriesFormSkeleton from "../Widgets/DebtSeriesFormSkeleton";

type Props = {
  seriesId: number | null;
  parSum: number | null;
  oidSum: number | null;
  onChange: (v: DebtSeries) => void;
  onInitialLoad: (v: any) => void;
  onValidate(results: { valid: boolean; errors: string[] }): void;
};

type FormState = {
  id: number;
  seriesName: string;
  isTaxExempt: boolean;
  parAmount: string;
  premium: string;
  costOfIssuance: string;
};

const parseDebtSeries = (form: FormState): DebtSeries => ({
  id: form.id || null,
  series_name: form.seriesName,
  is_tax_exempt: Number(form.isTaxExempt),
  par_amount: Number(form.parAmount || 0),
  premium: Number(form.premium || 0),
  cost_of_issuance: Number(form.costOfIssuance || 0),
  created_at: new Date().toISOString(),
});

const DebtSeriesForm: React.FC<Props> = ({
  seriesId,
  parSum,
  oidSum,
  onChange,
  onInitialLoad,
  onValidate,
}) => {
  const [form, setForm] = useState<FormState>({
    id: 0,
    seriesName: "",
    isTaxExempt: false,
    parAmount: parSum != null ? String(parSum) : "",
    premium: oidSum != null ? String(oidSum) : "",
    costOfIssuance: "",
  });

  const [loaded, setLoaded] = useState(false);

  // ✅ Load existing series
  useEffect(() => {
    if (seriesId == null) {
      setLoaded(true);
      return;
    }

    setLoaded(false);

    fetchById({
      endpoint: `/api/get/get_debt_series_by_id/${seriesId}`,
      entityName: "Debt Series",
      mapResponse: (raw: any) => {
        const s = Array.isArray(raw) ? raw[0] : raw;
        return {
          id: s?.id ?? 0,
          series_name: s?.series_name ?? "",
          is_tax_exempt: s?.is_tax_exempt ?? 0,
          par_amount: s?.par_amount ?? 0,
          premium: s?.premium ?? 0,
          cost_of_issuance: s?.cost_of_issuance ?? 0,
        };
      },
    })
      .then((data) => {
        setForm({
          id: data.id,
          seriesName: data.series_name,
          isTaxExempt: data.is_tax_exempt === 1,
          parAmount: String(data.par_amount ?? ""),
          premium: String(data.premium ?? ""),
          costOfIssuance: String(data.cost_of_issuance ?? ""),
        });

        onInitialLoad(data);
      })
      .finally(() => setLoaded(true));
  }, [seriesId, onInitialLoad]);

  // ✅ Unified change handler
  const updateForm = (next: FormState) => {
    setForm(next);

    const parsed = parseDebtSeries(next);
    const validation = validateDebtSeries(parsed);

    if (!validation.valid) {
      onValidate({ valid: false, errors: validation.errors });
      return;
    }

    onValidate({ valid: true, errors: [] });
    onChange(parsed);
  };

  if (!loaded) return <DebtSeriesFormSkeleton />;

  return (
    <div className="space-y-4 p-6 bg-white rounded-2xl shadow-lg">
      <label className="text-sm font-medium text-gray-800">Series Name</label>
      <input
        value={form.seriesName}
        onChange={(e) => updateForm({ ...form, seriesName: e.target.value })}
        className="w-full px-4 py-2 rounded-lg shadow-sm border border-gray-300
             focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* ✅ Accrual‑driven display only */}
      <ReadOnlyField label="Par Amount" value={formatNumber(form.parAmount)} />
      <ReadOnlyField label="Premium" value={formatNumber(form.premium)} />

      <label className="text-sm font-medium text-gray-800">
        Cost of Issuance
      </label>
      <input
        type="number"
        value={form.costOfIssuance}
        onChange={(e) =>
          updateForm({ ...form, costOfIssuance: e.target.value })
        }
        className="w-full px-4 py-2 rounded-lg shadow-sm border border-gray-300
             focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={form.isTaxExempt}
          onChange={(e) =>
            updateForm({ ...form, isTaxExempt: e.target.checked })
          }
        />
        Tax Exempt
      </label>
    </div>
  );
};

export default DebtSeriesForm;
