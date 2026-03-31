import React, { useState } from "react";
import DebtSeriesForm from "./DebtSeriesForm";
import DebtPricingUpload from "./DebtPricingUpload";
import DebtServiceUpload from "./DebtServiceUpload";

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

  const isValid =
    seriesFormData && pricingFormData.length > 0 && serviceFormData.length > 0;

  const handleSubmit = () => {
    if (!isValid) return alert("Missing required data");

    // example diffing:
    console.log("Series diff:", {
      before: seriesOriginal,
      after: seriesFormData,
    });
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
        disabled={!isValid}
        onClick={handleSubmit}
        className={`px-6 py-3 font-semibold rounded-lg shadow-md transition-all
          ${
            isValid
              ? "bg-white-600 text-white hover:bg-white-700 active:scale-95"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
      >
        Submit Debt Series
      </button>
    </div>
  );
};

export default DebtWebForm;
