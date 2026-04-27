import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DebtSeries,
  STRUCTURE_OPTIONS,
  USE_OF_PROCEEDS_OPTIONS,
} from "../Constants/Constants";
import { fetchById } from "../utils/api";
import DebtSeriesFormSkeleton from "../Widgets/DebtSeriesFormSkeleton";
import { validateDebtSeries, DebtSeriesFieldErrors } from "../utils/validate";
import { post, patch, get } from "../utils/func";
import {
  getSeriesIdByName,
  POST_DEBT_SERIES,
  PATCH_DEBT_SERIES,
  GET_ALL_SERIES_NAMES,
} from "../Constants/Constants";
import { toast } from "react-toastify";

type FormState = {
  id: number;
  seriesName: string;
  structure: string;
  isTaxExempt: boolean;
  costOfIssuance: string;
  useOfProceeds: string;
};

const MAX_LEN = 100;

const seriesNames = get(GET_ALL_SERIES_NAMES).then((res) => {
  if (Array.isArray(res)) {
    return res.map((item) => ({
      series_name: item.series_name,
    }));
  }
  return [];
});

const parseDebtSeries = (form: FormState): DebtSeries => {
  const rawCost = form.costOfIssuance.trim();
  const cost = rawCost === "" ? 0 : Number(rawCost);

  return {
    id: form.id || null,
    series_name: form.seriesName,
    structure: form.structure,
    is_tax_exempt: Number(form.isTaxExempt),
    cost_of_issuance: cost,
    use_of_proceeds: form.useOfProceeds,
    created_at: new Date().toISOString(),
  };
};

const DebtSeriesForm: React.FC = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();

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

  // show a general message at top (optional)
  const [submitError, setSubmitError] = useState<string | null>(null);

  // field-level errors shown under each field
  const [fieldErrors, setFieldErrors] = useState<DebtSeriesFieldErrors>({});

  // Load existing series
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
          use_of_proceeds: s?.use_of_proceeds ?? "",
        };
      },
    })
      .then((data) => {
        setForm({
          id: data.id,
          seriesName: String(data.series_name ?? "").slice(0, MAX_LEN),
          structure: String(data.structure ?? "").slice(0, MAX_LEN),
          isTaxExempt: !!data.is_tax_exempt,
          costOfIssuance: String(data.cost_of_issuance ?? "").slice(0, MAX_LEN),
          useOfProceeds: String(data.use_of_proceeds ?? "").slice(0, MAX_LEN),
        });

        // clear any stale errors after loading
        setFieldErrors({});
        setSubmitError(null);
      })
      .finally(() => setLoaded(true));
  }, [seriesId]);

  // styling helpers
  const errorClass = (hasError: boolean) =>
    hasError
      ? "border-red-400 focus:ring-red-500"
      : "border-gray-300 focus:ring-blue-500";

  const ErrorText = ({ msg }: { msg?: string }) =>
    msg ? <p className="mt-1 text-sm text-red-600">{msg}</p> : null;

  // cost input: keep numeric-ish but simple
  const normalizeCostInput = (value: string) => {
    let v = value.replace(/[^\d.]/g, "");
    const parts = v.split(".");
    if (parts.length > 2) v = `${parts[0]}.${parts.slice(1).join("")}`;
    return v.slice(0, MAX_LEN);
  };

  // simple update: enforce 100 chars, clear related field error
  const updateForm = (
    next: FormState,
    clearKey?: keyof DebtSeriesFieldErrors,
  ) => {
    const limited: FormState = {
      ...next,
      seriesName: next.seriesName.slice(0, MAX_LEN),
      structure: next.structure.slice(0, MAX_LEN),
      useOfProceeds: next.useOfProceeds.slice(0, MAX_LEN),
      costOfIssuance: next.costOfIssuance.slice(0, MAX_LEN),
    };

    setForm(limited);

    // clear top message as user edits
    if (submitError) setSubmitError(null);

    // clear just the field they edited (so errors go away naturally)
    if (clearKey && fieldErrors[clearKey]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[clearKey];
        return copy;
      });
    }
  };

  // Validate ONLY when submitting
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const parsed = parseDebtSeries(form);
    const option = seriesId ? "edit" : "create";
    const v = validateDebtSeries(parsed, seriesNames, option);

    if (!v.valid) {
      setFieldErrors(v.errors);
      setSubmitError("Please fix the errors below.");
      return;
    }

    // clear errors if valid
    setFieldErrors({});

    try {
      setIsSubmitting(true);

      if (parsed.id == null) {
        post(POST_DEBT_SERIES, parsed);
        get(getSeriesIdByName(parsed.series_name)).then((res) => {
          const s = Array.isArray(res) ? res[0] : res;
          navigate(`/debt-pricing/${s.id}`);
        });
      } else {
        patch(PATCH_DEBT_SERIES, parsed);
      }
    } catch (err: any) {
      toast.error("Something went wrong.", {
        position: "top-right",
        autoClose: 7000,
        pauseOnHover: true,
        closeOnClick: true,
      });
      setSubmitError(err?.message ?? "Something went wrong while submitting.");
    } finally {
      setIsSubmitting(false);
      toast.success("Debt Series saved successfully!", {
        position: "top-right",
        autoClose: 7000,
        pauseOnHover: true,
        closeOnClick: true,
      });
    }
  };

  if (!loaded) return <DebtSeriesFormSkeleton />;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 bg-white rounded-2xl shadow-lg"
    >
      {/* Submit-level error */}
      {submitError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {submitError}
        </div>
      )}

      {/* Series Name */}
      <div>
        <label className="text-sm font-medium text-gray-800">Series Name</label>
        <input
          value={form.seriesName}
          maxLength={MAX_LEN}
          onChange={(e) =>
            updateForm({ ...form, seriesName: e.target.value }, "series_name")
          }
          className={[
            "w-full px-4 py-2 rounded-lg shadow-sm border focus:outline-none focus:ring-2",
            errorClass(!!fieldErrors.series_name),
          ].join(" ")}
        />
        <ErrorText msg={fieldErrors.series_name} />
      </div>

      {/* Structure */}
      <div>
        <label className="text-sm font-medium text-gray-800">Structure</label>
        <select
          value={form.structure}
          onChange={(e) =>
            updateForm({ ...form, structure: e.target.value }, "structure")
          }
          className={[
            "w-full px-4 py-2 rounded-lg shadow-sm border focus:outline-none focus:ring-2 bg-white",
            errorClass(!!fieldErrors.structure),
          ].join(" ")}
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
        <ErrorText msg={fieldErrors.structure} />
      </div>

      {/* Use of Proceeds */}
      <div>
        <label className="text-sm font-medium text-gray-800">
          Use Of Proceeds
        </label>
        <select
          value={form.useOfProceeds}
          onChange={(e) =>
            updateForm(
              { ...form, useOfProceeds: e.target.value },
              "use_of_proceeds",
            )
          }
          className={[
            "w-full px-4 py-2 rounded-lg shadow-sm border focus:outline-none focus:ring-2 bg-white",
            errorClass(!!fieldErrors.use_of_proceeds),
          ].join(" ")}
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
        <ErrorText msg={fieldErrors.use_of_proceeds} />
      </div>

      {/* Cost of Issuance */}
      <div>
        <label className="text-sm font-medium text-gray-800">
          Cost of Issuance
        </label>
        <input
          type="text"
          inputMode="decimal"
          placeholder="0"
          value={form.costOfIssuance}
          maxLength={MAX_LEN}
          onChange={(e) =>
            updateForm(
              { ...form, costOfIssuance: normalizeCostInput(e.target.value) },
              "cost_of_issuance",
            )
          }
          className={[
            "w-full px-4 py-2 rounded-lg shadow-sm border focus:outline-none focus:ring-2",
            errorClass(!!fieldErrors.cost_of_issuance),
          ].join(" ")}
        />
        <ErrorText msg={fieldErrors.cost_of_issuance} />
      </div>

      {/* Tax Exempt */}
      <div>
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

      {/* Submit button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={[
            "w-full px-4 py-2 rounded-lg font-medium shadow-sm transition",
            isSubmitting
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
