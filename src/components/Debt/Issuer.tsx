import React, { useState } from "react";
import ThemedInput from "../Form/ThemedInput";

const IssuerForm: React.FC<{ onNext: () => void }> = ({ onNext }) => {
    const [issuer, setIssuer] = useState("");

    return (
        <div className="p-4">
            <h2 className="mb-4 text-xl font-semibold">Issuer Form</h2>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onNext();
                }}
                className="flex flex-col gap-4"
            >
                <ThemedInput
                    placeholder="Issuer Name"
                    value={issuer}
                    onChange={setIssuer}
                />
                <button
                    type="submit"
                    className="w-full rounded-lg bg-sky-700 px-4 py-2 font-semibold transition-all duration-300 hover:bg-sky-600 active:bg-sky-800 focus:ring-2 focus:ring-sky-500"
                >
                    Next
                </button>
            </form>
        </div>
    );
};

export default IssuerForm;