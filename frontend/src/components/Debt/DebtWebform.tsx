import React, { useEffect, useLayoutEffect, useState } from "react";
import DebtSeriesForm from "./DebtSeriesForm";
import DebtPricingUpload from "./DebtPricingUpload";
import DebtServiceUpload from "./DebtServiceUpload";
import { DebtSeries } from "../Constants/Get";

type DebtWebFormProps = {
  seriesId: number;
};

async function fetchDebtSeriesById(seriesId: number): Promise<DebtSeries> {
  try {
    const res = await fetch(
      `http://localhost:5000/get/get_debt_series_by_id/${seriesId}`,
    );
    const data = await res.json();
    console.log("Fetched debt series data:", data);
    return {
      id: data[0].id,
      series_name: data[0].series_name,
      is_tax_exempt: data[0].is_tax_exempt,
      par_amount: data[0].par_amount,
      premium: data[0].premium,
      cost_of_issuance: data[0].cost_of_issuance,
      created_at: data[0].created_at,
    } as DebtSeries;
  } catch (error) {
    console.error("Error fetching debt series data:", error);
    throw error;
  }
}

const DebtWebForm = ({ seriesId }: DebtWebFormProps) => {
  const [seriesFormData, setSeriesDataFormData] = useState<any>(null);
  const [pricingFormData, setPricingFormData] = useState<any[]>([]);
  const [serviceFormData, setServiceFormData] = useState<any[]>([]);
  const [initialSeriesData, setInitialSeriesData] = useState<DebtSeries | null>(
    null,
  );

  useEffect(() => {
    fetchDebtSeriesById(seriesId).then((data) => {
      if (data != null) setInitialSeriesData(data);
    });
  }, [seriesId]);

  const isValid =
    initialSeriesData &&
    pricingFormData.length > 0 &&
    serviceFormData.length > 0;

  const handleSubmit = () => {
    if (!isValid) return alert("Missing required data");
  };

  if (!initialSeriesData) return <div>Loading...</div>;

  return (
    <div className="space-y-8 mx-auto w-1/2 py-10">
      <DebtSeriesForm
        initialData={initialSeriesData}
        onChange={setSeriesDataFormData}
      />
      <DebtPricingUpload onChange={setPricingFormData} />
      <DebtServiceUpload onChange={setServiceFormData} />
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
