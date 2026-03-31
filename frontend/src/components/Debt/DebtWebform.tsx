import React, { useState } from "react";
import DebtSeriesForm from "./DebtSeriesForm";
import DebtPricingUpload from "./DebtPricingUpload";
import DebtServiceUpload from "./DebtServiceUpload";
import { performCrudOperations, SubmitPayload } from "../utils/func";

type DebtWebFormProps = {
  seriesId: number;
};

const DebtWebForm = ({ seriesId }: DebtWebFormProps) => {
  const [seriesOriginal, setSeriesOriginal] = useState<any>(null);
  const [pricingOriginal, setPricingOriginal] = useState<any[]>([]);
  const [serviceOriginal, setServiceOriginal] = useState<any[]>([]);

  const [seriesFormData, setSeriesFormData] = useState<any>(null);
  const [pricingFormData, setPricingFormData] = useState<any[]>([]);
  const [serviceFormData, setServiceFormData] = useState<any[]>([]);

  const handleSubmit = () => {
    const payload: SubmitPayload = {
      series: {
        original: seriesOriginal,
        current: seriesFormData,
      },
      pricing: {
        original: pricingOriginal,
        current: pricingFormData,
      },
      service: {
        original: serviceOriginal,
        current: serviceFormData,
      },
    };

    performCrudOperations(payload);
  };

  return (
    <div className="space-y-8 mx-auto w-1/2 py-10">
      <DebtSeriesForm
        seriesId={seriesId}
        onChange={setSeriesFormData}
        onInitialLoad={setSeriesOriginal}
      />

      <DebtPricingUpload
        seriesId={seriesId}
        onChange={setPricingFormData}
        onInitialLoad={setPricingOriginal}
      />

      <DebtServiceUpload
        seriesId={seriesId}
        onChange={setServiceFormData}
        onInitialLoad={setServiceOriginal}
      />

      <button
        onClick={handleSubmit}
        className="px-6 py-3 font-semibold rounded-lg shadow-md transition-all bg-gray-600 text-white hover:bg-white-700 active:scale-95"
      >
        Submit Debt Series
      </button>
    </div>
  );
};

export default DebtWebForm;
