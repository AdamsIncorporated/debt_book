import React from "react";

export default function DebtSeriesLandingIntroCard() {
  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-gray-900">Debt Book</h1>
        <p className="mt-1 text-sm text-gray-600">
          A centralized workspace for managing bond series, pricing structures,
          and long‑term debt service obligations for Travis County Healthcare
          District.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Feature
          title="📊 Series Overview"
          description="View and organize all issued debt series, including structure, tax status, and issuance details."
        />
        <Feature
          title="💰 Pricing & Costs"
          description="Track issuance costs, pricing structure, and premium or discount impacts across each series."
        />
        <Feature
          title="📆 Debt Service & Reporting"
          description="Drill into debt service schedules, validate cash flow impacts, and prepare downstream reporting."
        />
      </div>
    </div>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="text-sm font-medium text-gray-800">{title}</div>
      <div className="mt-1 text-sm text-gray-600 leading-relaxed">
        {description}
      </div>
    </div>
  );
}
