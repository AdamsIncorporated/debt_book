import React, { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import { downloadExcelTemplate } from "../utils/func";
import { DebtPricing } from "../Constants/Constants";

interface Props {
  seriesId: number;
  onChange: (v: DebtPricing[]) => void;
}

async function fetchDebtPricing(seriesId: number): Promise<DebtPricing[]> {
  try {
    console.log("Fetching debt pricing for series ID:", seriesId);
    const res = await fetch(
      `http://localhost:5000/get/get_debt_series_pricing_by_id/${seriesId}`,
    );
    const data = await res.json();
    console.log("Fetched debt pricing data:", data);
    return data.map((item: any) => ({
      id: item.id,
      series_id: item.series_id,
      maturity_date: item.maturity_date,
      amount: Number(item.amount),
      coupon_rate: Number(item.coupon_rate),
      yield_rate: Number(item.yield_rate),
      price: Number(item.price),
      premium_discount: Number(item.premium_discount),
    }));
  } catch (error) {
    console.error("Error fetching debt pricing:", error);
    return [];
  }
}

const DebtPricingUpload: React.FC<Props> = ({ seriesId, onChange }) => {
  const [rows, setRows] = useState<DebtPricing[]>([]);

  useEffect(() => {
    fetchDebtPricing(seriesId).then((data) => {
      if (data.length > 0) {
        setRows(data);
        onChange(data);
      }
    });
  }, [seriesId]);

  const handleUpload = async (file: File) => {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await file.arrayBuffer());
    const ws = wb.worksheets[0];
    const parsed: DebtPricing[] = [];
    ws.eachRow?.((row, idx) => {
      if (idx === 1) return;
      const [
        id,
        seriesId,
        maturity_date,
        amount,
        coupon_rate,
        yield_rate,
        price,
        premium_discount,
      ] = (row.values as any[]).slice(1);
      parsed.push({
        id: id,
        series_id: seriesId,
        maturity_date: maturity_date?.toString(),
        amount: Number(amount),
        coupon_rate: Number(coupon_rate),
        yield_rate: Number(yield_rate),
        price: Number(price),
        premium_discount: Number(premium_discount),
      });
    });
    setRows(parsed);
    onChange(parsed);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold">Debt Pricing Upload</h3>
      <label className="inline-flex w-full items-center gap-3 px-4 py-2 rounded-xl bg-white text-gray font-medium shadow-md cursor-pointer hover:bg-gray-100 active:scale-95 transition">
        📄 Upload Excel Pricing Schedule
        <input
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            handleUpload(file);
          }}
        />
        <button
          onClick={() =>
            downloadExcelTemplate(
              "DebtPricingTemplate.xlsx",
              "Debt Pricing",
              [
                "Id",
                "Series Id",
                "Maturity Date",
                "Amount",
                "Coupon Rate",
                "Yield Rate",
                "Price",
                "Premium/Discount",
              ],
              rows.map((r) => [
                r.id,
                r.series_id,
                r.maturity_date,
                r.amount,
                r.coupon_rate,
                r.yield_rate,
                r.price,
                r.premium_discount,
              ]),
            )
          }
          className="px-4 py-2 rounded-xl bg-white text-gray font-medium shadow-md hover:bg-gray-100 active:scale-95 transition cursor-pointer"
        >
          ⬇️ Download Template
        </button>
      </label>
      {rows.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-xl shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Id</th>
                <th className="px-3 py-2 text-left">Series Id</th>
                <th className="px-3 py-2 text-left">Maturity Date</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2 text-right">Coupon Rate</th>
                <th className="px-3 py-2 text-right">Yield</th>
                <th className="px-3 py-2 text-right">Price</th>
                <th className="px-3 py-2 text-right">Premium / Discount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2">{row.id}</td>
                  <td className="px-3 py-2">{row.series_id}</td>
                  <td className="px-3 py-2">{row.maturity_date}</td>
                  <td className="px-3 py-2 text-right">{row.amount}</td>
                  <td className="px-3 py-2 text-right">{row.coupon_rate}</td>
                  <td className="px-3 py-2 text-right">{row.yield_rate}</td>
                  <td className="px-3 py-2 text-right">{row.price}</td>
                  <td className="px-3 py-2 text-right">
                    {row.premium_discount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DebtPricingUpload;
