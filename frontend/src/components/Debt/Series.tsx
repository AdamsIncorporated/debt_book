import React, { useState } from "react";
import ThemedInput from "../Form/ThemedInput";
import ThemeNavButton from "../Form/ThemeNavButton";

interface DebtSeriesFormProps {
    onSubmit: (data: {
        seriesName: string;
    }) => void;
    onBack?: () => void;
}

const DebtSeriesForm: React.FC<DebtSeriesFormProps> = ({ onSubmit, onBack }) => {
    const [formData, setFormData] = useState({
        seriesName: "",
    });

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
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
            <div className="flex gap-4">
                <ThemeNavButton onBack={() => onBack} onNext={() => handleSubmit} />
            </div>
        </div>
    );
};

export default DebtSeriesForm;
