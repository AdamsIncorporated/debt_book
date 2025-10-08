import React, { useState } from 'react';

interface DebtIssuer {
    issuerName: string;
}

const Issuer: React.FC = () => {
    // Bag of entries
    const [issuers, setIssuers] = useState<DebtIssuer[]>([]);
    const [issuerName, setIssuerName] = useState('');

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!issuerName.trim()) return;

        const newIssuer: DebtIssuer = {
            issuerName: issuerName.trim(),
        };

        // Add to bag
        setIssuers([...issuers, newIssuer]);
        setIssuerName('');
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Add Debt Issuer</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                    type="text"
                    placeholder="Issuer Name"
                    value={issuerName}
                    onChange={(e) => setIssuerName(e.target.value)}
                    className="border p-2 rounded"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    Add
                </button>
            </form>

            <div className="mt-6">
                <h3 className="text-lg font-semibold">Current Bag</h3>
                <ul className="list-disc pl-5">
                    {issuers.map((issuer, idx) => (
                        <li key={idx}>{issuer.issuerName}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Issuer;
