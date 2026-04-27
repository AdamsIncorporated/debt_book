import React from "react";
import {
  STRUCTURE_OPTIONS,
  USE_OF_PROCEEDS_OPTIONS,
} from "../../Constants/Constants";

export const DebtSeriesFormFields = ({
  form,
  updateForm,
  fieldErrors,
}: any) => {
  const baseInputClasses =
    "w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm " +
    "focus:outline-none focus:ring-2 focus:ring-gray-200";

  const inputClass = (hasError: boolean) =>
    `${baseInputClasses} ${hasError ? "border-red-400" : "border-gray-300"}`;

  const ErrorText = ({ msg }: { msg?: string }) =>
    msg ? <p className="mt-1 text-sm text-red-600">{msg}</p> : null;

  return (
    <div className="space-y-4">
      {/* Series Name */}
      <div>
        <label className="text-sm font-medium text-gray-700">Series Name</label>
        <input
          value={form.seriesName ?? ""}
          onChange={(e) =>
            updateForm({ ...form, seriesName: e.target.value }, "series_name")
          }
          className={inputClass(!!fieldErrors.series_name)}
        />
        <ErrorText msg={fieldErrors.series_name} />
      </div>

      {/* Structure */}
      <div>
        <label className="text-sm font-medium text-gray-700">Structure</label>
        <select
          value={form.structure ?? ""}
          onChange={(e) =>
            updateForm({ ...form, structure: e.target.value }, "structure")
          }
          className={inputClass(!!fieldErrors.structure)}
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

      {/* Tax Exempt */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={!!form.isTaxExempt}
          onChange={(e) =>
            updateForm(
              { ...form, isTaxExempt: e.target.checked },
              "is_tax_exempt",
            )
          }
          className="h-4 w-4 rounded border-gray-300 text-gray-700 focus:ring-gray-200"
        />
        <label className="text-sm text-gray-700">Tax Exempt</label>
      </div>
      <ErrorText msg={fieldErrors.is_tax_exempt} />

      {/* Cost of Issuance */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Cost of Issuance
        </label>
        <input
          type="text"
          value={form.costOfIssuance ?? ""}
          onChange={(e) =>
            updateForm(
              { ...form, costOfIssuance: e.target.value },
              "cost_of_issuance",
            )
          }
          className={inputClass(!!fieldErrors.cost_of_issuance)}
        />
        <ErrorText msg={fieldErrors.cost_of_issuance} />
      </div>

      {/* Use of Proceeds */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Use of Proceeds
        </label>
        <select
          value={form.useOfProceeds ?? ""}
          onChange={(e) =>
            updateForm(
              { ...form, useOfProceeds: e.target.value },
              "use_of_proceeds",
            )
          }
          className={inputClass(!!fieldErrors.use_of_proceeds)}
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
    </div>
  );
};
