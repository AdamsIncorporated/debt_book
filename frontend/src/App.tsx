import React from "react";
import { ToastContainer } from "react-toastify";
import AppRoutes from "./DebtRouting";

const App: React.FC = () => {
  return (
    <div className="text-gray-700">
      <AppRoutes />
      <ToastContainer />
    </div>
  );
};

export default App;
