import { Routes, Route } from "react-router-dom";
import DebtSeriesLandingTable from "./components/Debt/DebtSeriesLandingTable";
import DebtSeriesForm from "./pages/DebtSeriesForm";
import DebtPricingUpload from "./components/Debt/DebtPricingUpload";
import DebtServiceUpload from "./components/Debt/DebtPricingUpload";
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
