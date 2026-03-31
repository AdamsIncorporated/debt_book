import React, { useState } from "react";
import DebtSeriesForm from "./DebtSeriesForm";
import DebtPricingUpload from "./DebtPricingUpload";
import DebtServiceUpload from "./DebtServiceUpload";
import { performCrudOperations, SubmitPayload } from "../utils/func";
import { runWithToasts } from "../Widgets/toast";

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

  const handleSubmit = async () => {
    const payload: SubmitPayload = {
      series: { original: seriesOriginal, current: seriesFormData },
      pricing: { original: pricingOriginal, current: pricingFormData },
      service: { original: serviceOriginal, current: serviceFormData },
    };

    await runWithToasts(() => performCrudOperations(payload));
  };

  return (
    <div className="space-y-12 mx-auto py-10">
      {/* Series Form → narrow */}
      <div className="mx-auto w-1/2">
        <DebtSeriesForm
          seriesId={seriesId}
          onChange={setSeriesFormData}
          onInitialLoad={setSeriesOriginal}
        />
      </div>

      {/* Pricing Upload → wide */}
      <div className="mx-auto w-5/6">
        <DebtPricingUpload
          seriesId={seriesId}
          onChange={setPricingFormData}
          onInitialLoad={setPricingOriginal}
        />
      </div>

      {/* Service Upload → wide */}
      <div className="mx-auto w-5/6">
        <DebtServiceUpload
          seriesId={seriesId}
          onChange={setServiceFormData}
          onInitialLoad={setServiceOriginal}
        />
      </div>

      {/* Submit Button */}
      <div className="mx-auto w-1/2">
        <button
          onClick={handleSubmit}
          className="px-6 py-3 font-semibold rounded-lg shadow-md transition-all bg-gray-600 text-white hover:cursor-pointer hover:bg-gray-700 active:scale-95 w-full"
        >
          Submit Debt Series
        </button>
      </div>
    </div>
  );
};

export default DebtWebForm;
