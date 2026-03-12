import React, { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import { downloadExcelTemplate } from "../utils/func";

interface DebtPricingRow {
  maturityDate: string;
  amount: number;
  couponRate: number;
  yield: number;
  price: number;
  premiumDiscount: number;
}

interface Props {
  seriesId: number;
  onChange: (v: DebtPricingRow[]) => void;
}

async function fetchDebtPricing(seriesId: number): Promise<DebtPricingRow[]> {
  try {
    const res = await fetch(
      `http://localhost:5000/get/get_debt_pricing/${seriesId}`,
    );
    const data = await res.json();
    return data.map((item: any) => ({
      maturityDate: item.maturity_date,
      amount: Number(item.amount),
      couponRate: Number(item.coupon_rate),
      yield: Number(item.yield_rate),
      price: Number(item.price),
      premiumDiscount: Number(item.premium_discount),
    }));
  } catch (error) {
    console.error("Error fetching debt pricing:", error);
    return [];
  }
}

const DebtPricingUpload: React.FC<Props> = ({ seriesId, onChange }) => {
  const [rows, setRows] = useState<DebtPricingRow[]>([]);

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
    const parsed: DebtPricingRow[] = [];
    ws.eachRow?.((row, idx) => {
      if (idx === 1) return;
      const [
        maturityDate,
        amount,
        couponRate,
        yieldRate,
        price,
        premiumDiscount,
      ] = (row.values as any[]).slice(1);
      parsed.push({
        maturityDate: maturityDate?.toString(),
        amount: Number(amount),
        couponRate: Number(couponRate),
        yield: Number(yieldRate),
        price: Number(price),
        premiumDiscount: Number(premiumDiscount),
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
            downloadExcelTemplate("DebtPricingTemplate.xlsx", "Debt Pricing", [
              "Maturity Date",
              "Amount",
              "Coupon Rate",
              "Yield Rate",
              "Price",
              "Premium/Discount",
            ])
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
                  <td className="px-3 py-2">{row.maturityDate}</td>
                  <td className="px-3 py-2 text-right">{row.amount}</td>
                  <td className="px-3 py-2 text-right">{row.couponRate}</td>
                  <td className="px-3 py-2 text-right">{row.yield}</td>
                  <td className="px-3 py-2 text-right">{row.price}</td>
                  <td className="px-3 py-2 text-right">
                    {row.premiumDiscount}
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
