import React from "react";
import DebtSeriesLandingTable from "./components/Debt/DebtSeriesLandingTable";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App: React.FC = () => {
  return (
    <div>
      <DebtSeriesLandingTable />
      <ToastContainer />
    </div>
  );
};

export default App;
