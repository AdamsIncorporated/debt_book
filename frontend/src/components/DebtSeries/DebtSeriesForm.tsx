// pages/DebtSeriesForm.tsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { parseDebtSeries } from "../../utils/parseDebtSeries";
import { validateDebtSeries } from "../../utils/validate";
import { post, patch, get } from "../../utils/api";
import {
  getSeriesIdByName,
  POST_DEBT_SERIES,
  PATCH_DEBT_SERIES,
} from "../../Constants/Constants";
import { useDebtSeriesLoader } from "../../hooks/useDebtSeriesLoader";
import { useAllSeriesNames } from "../../hooks/useAllSeriesNames";
import { DebtSeriesFormFields } from "../../components/DebtSeries/DebtSeriesFormFields";
import DebtSeriesFormSkeleton from "../../components/Widgets/DebtSeriesFormSkeleton";
import { FormActionBar } from "../../components/Widgets/FormActionBar";
import { toast } from "react-toastify";

const DebtSeriesForm = () => {
  const { seriesIdParam } = useParams<{ seriesIdParam: string }>();
  const seriesId = Number(seriesIdParam);
  const navigate = useNavigate();

  const [fieldErrors, setFieldErrors] = React.useState<any>({});
  const { seriesNames, seriesNamesLoaded } = useAllSeriesNames();
  const { form, setForm, existingSeriesName, loaded } =
    useDebtSeriesLoader(seriesId);

  console.log("form", form);

  if (!loaded || !seriesNamesLoaded || !form) return <DebtSeriesFormSkeleton />;

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      let seriesIdToNavigate: number | null = null;

      if (parsed.id == null) {
        // CREATE
        await post(POST_DEBT_SERIES, parsed);

        const res = await get(getSeriesIdByName(parsed.series_name));

        if (!res?.data?.id) {
          throw new Error("Failed to resolve newly created debt series ID");
        }

        seriesIdToNavigate = res.data.id;

        toast.success("Debt series created successfully");
      } else {
        // UPDATE
        await patch(PATCH_DEBT_SERIES, parsed);

        seriesIdToNavigate = parsed.id;

        toast.success("Debt series updated successfully");
      }

      navigate(`/debt-pricing/${seriesIdToNavigate}`);
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ??
          err?.message ??
          "Something went wrong while saving the debt series",
      );
    }
  };

  return (
    <form className="p-6 rounded-lg bg-white" onSubmit={handleSubmit}>
      <div className=""></div>
      <DebtSeriesFormFields
        form={form}
        updateForm={setForm}
        fieldErrors={fieldErrors}
      />
      <FormActionBar
        seriesId={seriesId}
        onBackwards={() => navigate(`/`)}
        onSkip={() => navigate(`/debt-pricing/${seriesId}`)}
        submitLabel={seriesId ? "Save Changes" : "Create Series"}
      />
    </form>
  );
};

export default DebtSeriesForm;
