import React, { useState } from "react";
import DebtSeriesForm from "./DebtSeriesForm";
import DebtPricingUpload from "./DebtPricingUpload";
import DebtServiceUpload from "./DebtServiceUpload";

const DebtWebForm = () => {
  const [series, setSeries] = useState<any>(null);
  const [pricing, setPricing] = useState<any[]>([]);
  const [service, setService] = useState<any[]>([]);

  const isValid = series && pricing.length > 0 && service.length > 0;

  const handleSubmit = () => {
    if (!isValid) return alert("Missing required data");

    const payload = {
      debtSeries: series,
      debtPricing: pricing,
      debtService: service,
    };

    console.log("FINAL JSON:", payload);
    // POST payload to API
  };

  return (
    <div className="space-y-8 mx-auto w-1/2 py-10">
      <DebtSeriesForm onChange={setSeries} />
      <DebtPricingUpload onChange={setPricing} />
      <DebtServiceUpload onChange={setService} />

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
