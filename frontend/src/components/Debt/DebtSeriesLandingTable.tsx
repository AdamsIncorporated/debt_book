import React, { useEffect, useState } from "react";
import DebtWebForm from "./DebtWebForm";

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
  const [showDebtForm, setDebtForm] = useState<boolean>(false);
  const [editingSeriesId, setEditingSeriesId] = useState<number | null>(null);

  const handleEditClick = (id: number) => {
    setEditingSeriesId(id);
    setDebtForm(true);
    console.log(`Edit button clicked for series ID: ${id}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/get/get_all_series");

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
      {(() => {
        switch (true) {
          case loading:
            return <div className="text-center py-10">Loading...</div>;

          case !!error:
            return (
              <div className="text-center py-10 text-red-600">
                Error: {error}
              </div>
            );

          case showDebtForm && editingSeriesId !== null:
            return <DebtWebForm seriesId={editingSeriesId} />;

          case !loading && !error:
            return (
              <table className="min-w-full">
                <thead className="border-2 border-gray-500">
                  <tr className="bg-gray-500">
                    <th className="text-white px-4 py-2">ID</th>
                    <th className="text-white px-4 py-2">Series Name</th>
                    <th className="text-white px-4 py-2">Tax Exempt</th>
                    <th className="text-white px-4 py-2">Par Amount</th>
                    <th className="text-white px-4 py-2">Premium</th>
                    <th className="text-white px-4 py-2">Cost of Issuance</th>
                    <th className="text-white px-4 py-2">Created At</th>
                    <th className="text-white px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {series.map((s) => (
                    <tr key={s.id ?? Math.random()}>
                      <td className="border-2 border-gray-500 px-4 py-2">
                        {s.id ?? "-"}
                      </td>
                      <td className="border-2 border-gray-500 px-4 py-2">
                        {s.series_name}
                      </td>
                      <td className="border-2 border-gray-500 px-4 py-2">
                        {s.is_tax_exempt ? "Yes" : "No"}
                      </td>
                      <td className="border-2 border-gray-500 px-4 py-2">
                        {s.par_amount.toLocaleString()}
                      </td>
                      <td className="border-2 border-gray-500 px-4 py-2">
                        {s.premium?.toLocaleString() ?? "-"}
                      </td>
                      <td className="border-2 border-gray-500 px-4 py-2">
                        {s.cost_of_issuance?.toLocaleString() ?? "-"}
                      </td>
                      <td className="border-2 border-gray-500 px-4 py-2">
                        {s.created_at ?? "-"}
                      </td>
                      <td className="border-2 border-gray-500 px-4 py-2">
                        <button
                          className="cursor-pointer bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                          onClick={() => handleEditClick(s.id ?? -1)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );

          default:
            return null;
        }
      })()}
    </div>
  );
};

export default DebtSeriesLandingTable;
