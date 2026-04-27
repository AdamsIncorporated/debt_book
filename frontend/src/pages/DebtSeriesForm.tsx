// pages/DebtSeriesForm.tsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { parseDebtSeries } from "../utils/parseDebtSeries";
import { validateDebtSeries } from "../utils/validate";
import { post, patch, get } from "../utils/func";
import {
  getSeriesIdByName,
  POST_DEBT_SERIES,
  PATCH_DEBT_SERIES,
} from "../Constants/Constants";
import { useSeriesNames } from "../hooks/useSeriesNames";
import { useDebtSeriesLoader } from "../hooks/useDebtSeriesLoader";
import { DebtSeriesFormFields } from "../components/DebtSeries/DebtSeriesFormFields";
import DebtSeriesFormSkeleton from "../components/Widgets/DebtSeriesFormSkeleton";
import { FormSubmitButton } from "../components/Widgets/FormSubmitButton";

const DebtSeriesForm = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();

  const [fieldErrors, setFieldErrors] = React.useState<any>({});
  const { seriesNames, seriesNamesLoaded } = useSeriesNames();
  const { form, setForm, existingSeriesName, loaded } =
    useDebtSeriesLoader(seriesId);

  console.log("form", form);

  if (!loaded || !seriesNamesLoaded || !form) return <DebtSeriesFormSkeleton />;

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const parsed = parseDebtSeries(form);
    const v = validateDebtSeries(parsed, seriesNames, {
      mode: seriesId ? "edit" : "create",
      originalName: existingSeriesName,
    });

    if (!v.valid) {
      setFieldErrors(v.errors);
      return;
    }

    if (parsed.id == null) {
      await post(POST_DEBT_SERIES, parsed);
      const res = await get(getSeriesIdByName(parsed.series_name));
      navigate(`/debt-pricing/${res.data.id}`);
    } else {
      await patch(PATCH_DEBT_SERIES, parsed);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DebtSeriesFormFields
        form={form}
        updateForm={setForm}
        fieldErrors={fieldErrors}
      />
      <FormSubmitButton />
    </form>
  );
};

export default DebtSeriesForm;
