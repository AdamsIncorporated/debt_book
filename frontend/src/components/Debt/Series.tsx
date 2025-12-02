import React, { useState } from "react";
import ThemedInput from "../Form/ThemedInput";
import ThemeNavButton from "../Form/ThemeNavButton";
import { addUpdateRowsToBag } from "bag/bag";
import { ToastContainer, toast } from "react-toastify";

interface DebtSeriesFormProps {
  onNext: () => void;
  onBack: () => void;
}

function validateDebtSeriesForm(data: { seriesName: string }): boolean {
  const isNotZeroLength = data.seriesName.trim().length > 0;
  const isBelowMaxLength = data.seriesName.length <= 100;

  if (!isBelowMaxLength) {
    toast.error("Series name must be 100 characters or less.");
    return false;
  }

  if (!isNotZeroLength) {
    toast.error("Series name cannot be empty.");
    return false;
  }

  return true;
}

const DebtSeriesForm: React.FC<DebtSeriesFormProps> = ({ onNext, onBack }) => {
  const [formData, setFormData] = useState({
    seriesName: "",
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the form data
    if (validateDebtSeriesForm(formData)) {
      onNext();
    }
  };

  return (
    <div className="text-gray-800 p-4 xl shadow-md w-full max-w-lg mx-auto">
      <h2 className="mb-6 text-xl font-semibold">Debt Series Form</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ThemedInput
          placeholder="Series Name"
          value={formData.seriesName}
          onChange={(val) => handleChange("seriesName", val)}
        />
      </form>
      <div className="my-2">
        <ThemeNavButton onBack={onBack} onNext={onNext} />
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default DebtSeriesForm;
