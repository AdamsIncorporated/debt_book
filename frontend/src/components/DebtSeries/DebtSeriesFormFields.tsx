// components/DebtSeriesFormFields.tsx
import {
  STRUCTURE_OPTIONS,
  USE_OF_PROCEEDS_OPTIONS,
} from "../../Constants/Constants";
import { normalizeCostInput } from "../../utils/normalizeCostInput";
import { DebtSeriesFieldErrors } from "../../utils/validate";

export const DebtSeriesFormFields = ({
  form,
  updateForm,
  fieldErrors,
}: any) => {
  const errorClass = (hasError: boolean) =>
    hasError ? "border-red-400" : "border-gray-300";

  const ErrorText = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-sm text-red-600">{msg}</p> : null;

  return (
    <>
      {/* Series Name */}
      <div>
        <label>Series Name</label>
        <input
          value={form.seriesName}
          onChange={(e) =>
            updateForm({ ...form, seriesName: e.target.value }, "series_name")
          }
          className={errorClass(!!fieldErrors.series_name)}
        />
        <ErrorText msg={fieldErrors.series_name} />
      </div>

      {/* Structure */}
      <div>
        <label>Structure</label>
        <select
          value={form.structure}
          onChange={(e) =>
            updateForm({ ...form, structure: e.target.value }, "structure")
          }
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

      {/* Remaining fields omitted for brevity */}
    </>
  );
};
