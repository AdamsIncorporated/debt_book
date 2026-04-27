import { Routes, Route } from "react-router-dom";
import DebtSeriesLandingTable from "./components/DebtService/DebtSeriesLandingTable";
import DebtSeriesForm from "./components/DebtSeries/DebtSeriesForm";
import DebtPricingUpload from "./components/DebtPricing/DebtPricingUpload";
import DebtServiceUpload from "./components/DebtPricing/DebtPricingUpload";
import React from "react";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DebtSeriesLandingTable />} />
      <Route path="/debt-series/:seriesId" element={<DebtSeriesForm />} />
      <Route path="/debt-pricing/:seriesId" element={<DebtPricingUpload />} />
      <Route path="/debt-service/:seriesId" element={<DebtServiceUpload />} />
      <Route
        path="/debt-series/create-new-series"
        element={<DebtSeriesForm />}
      />
    </Routes>
  );
}
