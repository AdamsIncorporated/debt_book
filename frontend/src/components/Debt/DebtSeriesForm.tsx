import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  DebtSeries,
  STRUCTURE_OPTIONS,
  USE_OF_PROCEEDS_OPTIONS,
} from "../Constants/Constants";
import { fetchById } from "../utils/api";
import { validateDebtSeries } from "../utils/validate";
import DebtSeriesFormSkeleton from "../Widgets/DebtSeriesFormSkeleton";

type FormState = {
  id: number;
  seriesName: string;
  structure: string;
  isTaxExempt: boolean;
  costOfIssuance: string;
  useOfProceeds: string;
};

const parseDebtSeries = (form: FormState): DebtSeries => ({
  id: form.id || null,
  series_name: form.seriesName,
  structure: form.structure,
  is_tax_exempt: Number(form.isTaxExempt),
  cost_of_issuance: Number(form.costOfIssuance || 0),
  use_of_proceeds: form.useOfProceeds,
  created_at: new Date().toISOString(),
});

const DebtSeriesForm: React.FC = () => {
  const { seriesId } = useParams();
  const [form, setForm] = useState<FormState>({
    id: 0,
    seriesName: "",
    structure: "",
    isTaxExempt: false,
    costOfIssuance: "",
    useOfProceeds: "",
  });

  const [loaded, setLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store validation result to display feedback + control button state
  const [submitError, setSubmitError] = useState<string | null>(null);

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
          structure: s?.structure ?? "",
          is_tax_exempt: s?.is_tax_exempt ?? 0,
          cost_of_issuance: s?.cost_of_issuance ?? 0,
          use_of_proceeds: s?.use_of_proceeds ?? "", // ⚠️ fixed (was series_name)
        };
      },
    })
      .then((data) => {
        setForm({
          id: data.id,
          seriesName: data.series_name,
          structure: data.structure,
          isTaxExempt: data.is_tax_exempt === 1,
          costOfIssuance: String(data.cost_of_issuance ?? ""),
          useOfProceeds: data.use_of_proceeds,
        });
      })
      .finally(() => setLoaded(true));
  }, [seriesId]);

  // ✅ Compute validation any time form changes (no guessing format of validateDebtSeries output)
  const validation = useMemo(() => {
    const parsed = parseDebtSeries(form);
    return validateDebtSeries(parsed);
  }, [form]);

  // ✅ Unified change handler
  const updateForm = (next: FormState) => {
    setForm(next);
    // Clear submit-level error as user edits
    if (submitError) setSubmitError(null);
  };

  // ✅ Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const parsed = parseDebtSeries(form);
    const v = validateDebtSeries(parsed);

    if (!v?.valid) {
      // Best-effort message without assuming validateDebtSeries shape beyond `.valid`
      // If your validator exposes errors (e.g., v.errors), you can surface those here.
      setSubmitError("Please fix validation errors before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
    } catch (err: any) {
      setSubmitError(err?.message ?? "Something went wrong while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!loaded) return <DebtSeriesFormSkeleton />;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 bg-white rounded-2xl shadow-lg"
    >
      <label className="text-sm font-medium text-gray-800">Series Name</label>
      <input
        value={form.seriesName}
        onChange={(e) => updateForm({ ...form, seriesName: e.target.value })}
        className="w-full px-4 py-2 rounded-lg shadow-sm border border-gray-300
             focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <label className="text-sm font-medium text-gray-800">Structure</label>
      <select
        value={form.structure}
        onChange={(e) => updateForm({ ...form, structure: e.target.value })}
        className="w-full px-4 py-2 rounded-lg shadow-sm border border-gray-300
             focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="" disabled>
          Select structure…
        </option>
        {STRUCTURE_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <label className="text-sm font-medium text-gray-800">
        Use Of Proceeds
      </label>
      <select
        value={form.useOfProceeds}
        onChange={(e) => updateForm({ ...form, useOfProceeds: e.target.value })}
        className="w-full px-4 py-2 rounded-lg shadow-sm border border-gray-300
             focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="" disabled>
          Select use of proceeds…
        </option>
        {USE_OF_PROCEEDS_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

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

      {/* Submit-level error */}
      {submitError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {submitError}
        </div>
      )}

      {/* Submit button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !validation?.valid}
          className={[
            "w-full px-4 py-2 rounded-lg font-medium shadow-sm transition",
            isSubmitting || !validation?.valid
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700",
          ].join(" ")}
        >
          {isSubmitting ? "Saving..." : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default DebtSeriesForm;
