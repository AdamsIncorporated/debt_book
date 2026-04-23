import { Routes, Route } from "react-router-dom";
import DebtSeriesLandingTable from "./DebtSeriesLandingTable";
import DebtSeriesForm from "./DebtSeriesForm";
import React from "react";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DebtSeriesLandingTable />} />
      <Route path="/debt-series/:id" element={<DebtSeriesForm />} />
      <Route
        path="/debt-series/create-new-series"
        element={<DebtSeriesForm />}
      />
    </Routes>
  );
}
