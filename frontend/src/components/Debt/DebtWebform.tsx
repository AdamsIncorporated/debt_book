import React, { useState } from "react";
import DebtSeriesForm from "./DebtSeriesForm";
import DebtPricingUpload from "./DebtPricingUpload";
import DebtServiceUpload from "./DebtServiceUpload";
// import DebtSeries from "../Constants/Get";

type DebtWebFormProps = {
  seriesId: number;
};

const debtSeriesData = async (id: number) => {
  try {
    const res = await fetch(
      `http://localhost:5000/get/get_debt_series_by_id/${id}`,
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching debt series data:", error);
    throw error;
  }
};

const DebtWebForm = ({ seriesId }: DebtWebFormProps) => {
  const [series, setSeries] = useState<any>(null);
  const [pricing, setPricing] = useState<any[]>([]);
  const [service, setService] = useState<any[]>([]);

  const isValid = series && pricing.length > 0 && service.length > 0;
  const debtseriesData = debtSeriesData(seriesId);

  const handleSubmit = () => {
    if (!isValid) return alert("Missing required data");
  };

  return (
    <div className="space-y-8 mx-auto w-1/2 py-10">
      debtseriesData: {JSON.stringify(debtseriesData)}
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
