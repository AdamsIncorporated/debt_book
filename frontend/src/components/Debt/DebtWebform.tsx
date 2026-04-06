import React, { useState } from "react";
import DebtSeriesForm from "./DebtSeriesForm";
import DebtPricingUpload from "./DebtPricingUpload";
import DebtServiceUpload from "./DebtServiceUpload";
import { performCrudOperations, SubmitPayload } from "../utils/func";
import { runWithToasts } from "../Widgets/toast";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const DebtWebForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const seriesId = id ? Number(id) : null;
  console.log("DebtWebForm initialized with seriesId:", seriesId);

  const [seriesOriginal, setSeriesOriginal] = useState<any>(null);
  const [pricingOriginal, setPricingOriginal] = useState<any[]>([]);
  const [serviceOriginal, setServiceOriginal] = useState<any[]>([]);

  const [seriesFormData, setSeriesFormData] = useState<any>(null);
  const [pricingFormData, setPricingFormData] = useState<any[]>([]);
  const [serviceFormData, setServiceFormData] = useState<any[]>([]);

  const [seriesValid, setSeriesValid] = useState(false);
  const [pricingValid, setPricingValid] = useState(false);
  const [serviceValid, setServiceValid] = useState(false);

  const handleSubmit = async () => {
    const formValid = seriesValid && pricingValid && serviceValid;

    if (!formValid) {
      toast.error(
        "You have validation errors. Please fix them before submitting.",
      );
      return;
    }

    const payload: SubmitPayload = {
      series: { original: seriesOriginal, current: seriesFormData },
      pricing: { original: pricingOriginal, current: pricingFormData },
      service: { original: serviceOriginal, current: serviceFormData },
    };

    await runWithToasts(() => performCrudOperations(payload));
  };

  return (
    <div className="m-6">
      {/* Back (Refresh) Button */}
      <div className="w-auto">
        <button
          onClick={() => navigate("/")}
          className="
      px-6 py-3 
      font-semibold rounded-lg shadow-md 
      transition-all 
      bg-gray-300 text-gray-800
      hover:bg-gray-400 active:scale-95
      hover:cursor-pointer
    "
        >
          ← Back
        </button>
      </div>
      <div className="space-y-12 mx-auto py-10">
        {/* Series Form → narrow */}
        <div className="mx-auto w-1/2">
          <DebtSeriesForm
            seriesId={seriesId}
            onChange={setSeriesFormData}
            onInitialLoad={setSeriesOriginal}
            onValidate={({ valid }) => setSeriesValid(valid)}
          />
        </div>

        {/* Pricing Upload → wide */}
        <div className="mx-auto w-5/6">
          <DebtPricingUpload
            seriesId={seriesId}
            onChange={setPricingFormData}
            onInitialLoad={setPricingOriginal}
            onValidate={({ valid }) => setPricingValid(valid)}
          />
        </div>

        {/* Service Upload → wide */}
        <div className="mx-auto w-5/6">
          <DebtServiceUpload
            seriesId={seriesId}
            onChange={setServiceFormData}
            onInitialLoad={setServiceOriginal}
            onValidate={({ valid }) => setServiceValid(valid)}
          />
        </div>
      </div>
      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="my-6 px-6 py-3 font-semibold rounded-lg shadow-md transition-all bg-gray-600 text-white hover:cursor-pointer hover:bg-gray-700 active:scale-95 w-fit"
      >
        💾 Submit Debt Series
      </button>
    </div>
  );
};

export default DebtWebForm;
