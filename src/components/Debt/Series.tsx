import React, { useState } from "react";
import ThemedInput from "../Form/ThemedInput";

interface DebtSeriesFormProps {
    onSubmit: (data: {
        issuanceId: string;
        seriesName: string;
        lastMaturity: string;
        arbitrageYield: string;
        trueInterestCost: string;
        netInterestCost: string;
        allInTIC: string;
        averageCoupon: string;
        averageLifeYears: string;
        durationOfIssueYears: string;
        parAmount: string;
        bondProceeds: string;
        totalInterest: string;
        netInterest: string;
        totalDebtService: string;
        maxAnnualDebtService: string;
        avgAnnualDebtService: string;
        totalUnderwritersDiscount: string;
        bidPrice: string;
    }) => void;
    onBack?: () => void;
}

const DebtSeriesForm: React.FC<DebtSeriesFormProps> = ({ onSubmit, onBack }) => {
    const [formData, setFormData] = useState({
        issuanceId: "",
        seriesName: "",
        lastMaturity: "",
        arbitrageYield: "",
        trueInterestCost: "",
        netInterestCost: "",
        allInTIC: "",
        averageCoupon: "",
        averageLifeYears: "",
        durationOfIssueYears: "",
        parAmount: "",
        bondProceeds: "",
        totalInterest: "",
        netInterest: "",
        totalDebtService: "",
        maxAnnualDebtService: "",
        avgAnnualDebtService: "",
        totalUnderwritersDiscount: "",
        bidPrice: "",
    });

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="p-4 bg-sky-950 rounded-xl shadow-md w-full max-w-lg mx-auto">
            <h2 className="mb-6 text-xl font-semibold text-white">Debt Series Form</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <ThemedInput
                    placeholder="Issuance ID"
                    value={formData.issuanceId}
                    onChange={(val) => handleChange("issuanceId", val)}
                />
                <ThemedInput
                    placeholder="Series Name"
                    value={formData.seriesName}
                    onChange={(val) => handleChange("seriesName", val)}
                />
                <input
                    type="date"
                    placeholder="Last Maturity"
                    value={formData.lastMaturity}
                    onChange={(e) => handleChange("lastMaturity", e.target.value)}
                    className="w-full rounded-xl border border-sky-700 bg-sky-950/40 px-4 py-2 text-white outline-none transition-all duration-300 focus:border-sky-400 focus:bg-sky-900/50 focus:ring-2 focus:ring-sky-500"
                />

                {/* Numeric fields */}
                {[
                    "arbitrageYield",
                    "trueInterestCost",
                    "netInterestCost",
                    "allInTIC",
                    "averageCoupon",
                    "averageLifeYears",
                    "durationOfIssueYears",
                    "parAmount",
                    "bondProceeds",
                    "totalInterest",
                    "netInterest",
                    "totalDebtService",
                    "maxAnnualDebtService",
                    "avgAnnualDebtService",
                    "totalUnderwritersDiscount",
                    "bidPrice",
                ].map((field) => (
                    <ThemedInput
                        key={field}
                        placeholder={field.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                        value={formData[field as keyof typeof formData]}
                        onChange={(val) => handleChange(field as keyof typeof formData, val)}
                    />
                ))}

                <div className="flex gap-4 mt-4">
                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex-1 rounded-lg border border-sky-700 bg-sky-800 px-4 py-2 text-white font-semibold transition-all duration-300 hover:bg-sky-700"
                        >
                            Back
                        </button>
                    )}
                    <button
                        type="submit"
                        className="flex-1 rounded-lg bg-sky-700 px-4 py-2 text-white font-semibold transition-all duration-300 hover:bg-sky-600 active:bg-sky-800 focus:ring-2 focus:ring-sky-500"
                    >
                        Next
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DebtSeriesForm;
