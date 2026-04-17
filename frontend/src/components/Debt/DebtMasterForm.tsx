import React, { useMemo, useState } from "react";
import DebtSeriesForm from "./DebtSeriesForm";
import DebtPricingUpload from "./DebtPricingUpload";
import DebtServiceUpload from "./DebtServiceUpload";
import { performCrudOperations, SubmitPayload } from "../utils/func";
import { runWithToasts } from "../Widgets/toast";
import { useNavigate, useParams } from "react-router-dom";

const DebtMasterForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const seriesId = id ? Number(id) : null;

  const [seriesOriginal, setSeriesOriginal] = useState<any>(null);
  const [pricingOriginal, setPricingOriginal] = useState<any[]>([]);
  const [serviceOriginal, setServiceOriginal] = useState<any[]>([]);

  const [seriesFormData, setSeriesFormData] = useState<any>(null);
  const [pricingFormData, setPricingFormData] = useState<any[]>([]);
  const [serviceFormData, setServiceFormData] = useState<any[]>([]);

  const [isSeriesValid, setIsSeriesValid] = useState<boolean | null>(null);
  const [isPricingValid, setIsPricingValid] = useState<boolean | null>(null);
  const [isServiceValid, setIsServiceValid] = useState<boolean | null>(null);

  const isFormValid = [isSeriesValid, isPricingValid, isServiceValid].every(
    (v) => v !== false,
  );

  const handlePricingChange = (rows: any[]) => {
    setPricingFormData([...rows]); // force new reference
  };

  const handleServiceChange = (rows: any[]) => {
    setServiceFormData([...rows]); // force new reference
  };

  const handleSubmit = async () => {
    const payload: SubmitPayload = {
      series: { original: seriesOriginal, current: seriesFormData },
      pricing: { original: pricingOriginal, current: pricingFormData },
      service: { original: serviceOriginal, current: serviceFormData },
    };

    await runWithToasts(() => performCrudOperations(payload));

    navigate("/");
  };

  /* ✅ MEMOS (NO CHANGE NEEDED) */
  const { parSum, premiumDiscountSum } = useMemo(() => {
    return pricingFormData.reduce(
      (acc, row) => {
        acc.parSum += Number(row.amount || 0);
        acc.premiumDiscountSum += Number(row.premium_discount || 0);
        return acc;
      },
      { parSum: 0, premiumDiscountSum: 0 },
    );
  }, [pricingFormData]);

  return (
    <div className="m-6">
      <div className="w-auto">
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 font-semibold rounded-lg shadow-md bg-gray-300 hover:bg-gray-400"
        >
          ← Back
        </button>
      </div>

      <div className="space-y-12 mx-auto py-10">
        <div className="mx-auto w-1/2">
          <DebtSeriesForm
            seriesId={seriesId}
            parSum={parSum}
            premiumDiscountSum={premiumDiscountSum}
            onChange={setSeriesFormData}
            onInitialLoad={setSeriesOriginal}
            onValidate={({ valid }) => setIsSeriesValid(valid)}
          />
        </div>

        <div className="mx-auto w-5/6">
          <DebtPricingUpload
            seriesId={seriesId}
            onChange={handlePricingChange}
            onInitialLoad={setPricingOriginal}
            onValidate={({ valid }) => setIsPricingValid(valid)}
          />
        </div>

        <div className="mx-auto w-5/6">
          <DebtServiceUpload
            seriesId={seriesId}
            onChange={handleServiceChange}
            onInitialLoad={setServiceOriginal}
            onValidate={({ valid }) => setIsServiceValid(valid)}
          />
        </div>
      </div>

      {isFormValid && (
        <button
          onClick={handleSubmit}
          className="my-6 px-6 py-3 font-semibold rounded-lg shadow-md bg-gray-600 text-white hover:bg-gray-700"
        >
          💾 Submit Debt Series
        </button>
      )}
    </div>
  );
};

export default DebtMasterForm;
