import { Routes, Route } from "react-router-dom";
import DebtSeriesLandingTable from "./DebtSeriesLandingTable";
import DebtWebForm from "./DebtWebForm";
import React from "react";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DebtSeriesLandingTable />} />
      <Route
        path="/debt-series/new"
        element={<DebtWebForm seriesId={null} />}
      />
      <Route path="/debt-series/:id" element={<DebtWebForm />} />
    </Routes>
  );
}
