import React, { useState } from "react";
import ThemedInput from "../Form/ThemedInput";
import ThemeNavButton from "../Form/ThemeNavButton";
import { addUpdateRowsToBag } from "bag/bag";
import { useBag } from "bag/store";

interface DebtSeriesFormProps {
  onNext: () => void;
  onBack: () => void;
}

const DebtSeriesForm: React.FC<DebtSeriesFormProps> = ({ onNext, onBack }) => {
  const [formData, setFormData] = useState({ seriesName: "" });
  const [error, setError] = useState("");
  const { state, dispatch } = useBag();

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(""); // Clear error on change
  };

  const handleNext = () => {
    // Validate the form data
    if (!formData.seriesName.trim()) {
      setError("Series name cannot be empty.");
      return;
    }
    if (formData.seriesName.length > 100) {
      setError("Series name must be 100 characters or less.");
      return;
    }

    // Clear any previous errors and go to next
    setError("");

    // Simple Unique Id
    const uuid = crypto.randomUUID();
    dispatch({
      type: "ADD_ITEM",
      payload: { id: uuid, name: formData.seriesName },
    });

    onNext();
  };

  return (
    <div className="text-gray-800 p-4 xl shadow-md w-full max-w-lg mx-auto">
      <h2 className="mb-6 text-xl font-semibold">Debt Series Form</h2>

      <div className="flex flex-col gap-1">
        <ThemedInput
          placeholder="Series Name"
          value={formData.seriesName}
          onChange={(val) => handleChange("seriesName", val)}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}{" "}
      </div>

      <div className="my-2">
        <ThemeNavButton onBack={onBack} onNext={handleNext} />
      </div>
    </div>
  );
};

export default DebtSeriesForm;
