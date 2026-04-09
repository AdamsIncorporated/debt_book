import { Routes, Route } from "react-router-dom";
import DebtSeriesLandingTable from "./DebtSeriesLandingTable";
import DebtMasterForm from "./DebtMasterForm";
import React from "react";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DebtSeriesLandingTable />} />
      <Route path="/create-new-series" element={<DebtMasterForm />} />
      <Route path="/debt-series/:id" element={<DebtMasterForm />} />
    </Routes>
  );
}
