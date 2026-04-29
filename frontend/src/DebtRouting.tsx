import { Routes, Route } from "react-router-dom";
import DebtSeriesLandingTable from "./components/DebtService/DebtSeriesLandingTable";
import DebtSeriesForm from "./components/DebtSeries/DebtSeriesForm";
import DebtPricingUpload from "./components/DebtPricing/DebtPricingUpload";
import DebtServiceUpload from "./components/DebtService/DebtServiceUpload";
import React from "react";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DebtSeriesLandingTable />} />
      <Route path="/debt-series/:seriesIdParam" element={<DebtSeriesForm />} />
      <Route
        path="/debt-pricing/:seriesIdParam"
        element={<DebtPricingUpload />}
      />
      <Route
        path="/debt-service/:seriesIdParam"
        element={<DebtServiceUpload />}
      />
      <Route
        path="/debt-series/create-new-series"
        element={<DebtSeriesForm />}
      />
    </Routes>
  );
}
