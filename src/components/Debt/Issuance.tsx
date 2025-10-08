import React, { useState } from "react";
import ThemedInput from "../Form/ThemedInput";

interface DebtIssuanceFormProps {
    onSubmit: (data: {
        issuerId: string;
        name: string;
        datedDate: string;
        deliveryDate: string;
        totalParIssued: string;
    }) => void;
    onBack?: () => void;
}

const IssuanceForm: React.FC<DebtIssuanceFormProps> = ({ onSubmit, onBack }) => {
    const [issuerId, setIssuerId] = useState("");
    const [name, setName] = useState("");
    const [datedDate, setDatedDate] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [totalParIssued, setTotalParIssued] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ issuerId, name, datedDate, deliveryDate, totalParIssued });
    };

    return (
        <div className="p-4 bg-sky-950 rounded-xl shadow-md w-full max-w-lg mx-auto">
            <h2 className="mb-6 text-xl font-semibold text-white">Debt Issuance Form</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <ThemedInput
                    placeholder="Issuer ID"
                    value={issuerId}
                    onChange={setIssuerId}
                />
                <ThemedInput
                    placeholder="Name"
                    value={name}
                    onChange={setName}
                />
                <input
                    type="date"
                    placeholder="Dated Date"
                    value={datedDate}
                    onChange={(e) => setDatedDate(e.target.value)}
                    className="w-full rounded-xl border border-sky-700 bg-sky-950/40 px-4 py-2 text-white outline-none transition-all duration-300 focus:border-sky-400 focus:bg-sky-900/50 focus:ring-2 focus:ring-sky-500"
                />
                <input
                    type="date"
                    placeholder="Delivery Date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full rounded-xl border border-sky-700 bg-sky-950/40 px-4 py-2 text-white outline-none transition-all duration-300 focus:border-sky-400 focus:bg-sky-900/50 focus:ring-2 focus:ring-sky-500"
                />
                <ThemedInput
                    placeholder="Total Par Issued"
                    value={totalParIssued}
                    onChange={setTotalParIssued}
                />

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

export default IssuanceForm;
