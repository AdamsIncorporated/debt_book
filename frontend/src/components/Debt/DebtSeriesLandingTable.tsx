import React, { useEffect, useState } from "react";

interface DebtSeries {
  id?: number;
  series_name: string;
  is_tax_exempt?: boolean;
  par_amount: number;
  premium?: number;
  cost_of_issuance?: number;
  created_at?: string;
}

const DebtSeriesLandingTable: React.FC = () => {
  const [series, setSeries] = useState<DebtSeries[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/debt/get_all_series");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: DebtSeries[] = await res.json();
        setSeries(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="h-lvh space-y-8 mx-auto w-1/2 py-10">
      {loading && <div className="text-center py-10">Loading...</div>}
      {error && (
        <div className="text-center py-10 text-red-600">Error: {error}</div>
      )}

      {!loading && !error && (
        <table className="min-w-full border border-gray-100">
          <thead className="bg-gray-100">
            <tr>
              <th className="bg-gray-500 text-white px-4 py-2">ID</th>
              <th className="bg-gray-500 text-white px-4 py-2">Series Name</th>
              <th className="bg-gray-500 text-white px-4 py-2">Tax Exempt</th>
              <th className="bg-gray-500 text-white px-4 py-2">Par Amount</th>
              <th className="bg-gray-500 text-white px-4 py-2">Premium</th>
              <th className="bg-gray-500 text-white px-4 py-2">
                Cost of Issuance
              </th>
              <th className="bg-gray-500 text-white px-4 py-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {series.map((s) => (
              <tr key={s.id ?? Math.random()}>
                <td className="border px-4 py-2">{s.id ?? "-"}</td>
                <td className="border px-4 py-2">{s.series_name}</td>
                <td className="border px-4 py-2">
                  {s.is_tax_exempt ? "Yes" : "No"}
                </td>
                <td className="border px-4 py-2">
                  {s.par_amount.toLocaleString()}
                </td>
                <td className="border px-4 py-2">
                  {s.premium?.toLocaleString() ?? "-"}
                </td>
                <td className="border px-4 py-2">
                  {s.cost_of_issuance?.toLocaleString() ?? "-"}
                </td>
                <td className="border px-4 py-2">{s.created_at ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DebtSeriesLandingTable;
