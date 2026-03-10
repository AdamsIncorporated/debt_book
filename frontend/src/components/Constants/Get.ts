// Represents a simple series name
export interface SeriesNameList {
  name: string;
}

// Represents a patch request for debt series, pricing, and service
export interface DebtSeriesPatchJson {
  debt_series: DebtSeries[];
  debt_pricing: DebtPricing[];
  debt_service: DebtService[];
}

// Represents a debt series
export interface DebtSeries {
  id: number; // i64 → number
  series_name: string;
  is_tax_exempt?: boolean | null;
  par_amount: number;
  premium?: number | null;
  cost_of_issuance?: number | null;
  created_at?: string | null; // optional timestamp string
}

// Represents debt pricing information
export interface DebtPricing {
  id: number;
  series_id: number;
  maturity_date: string; // YYYY-MM-DD
  amount: number;
  coupon_rate: number;
  yield_rate: number;
  price: number;
  premium_discount?: number | null;
  created_at?: string | null;
}

// Represents debt service information
export interface DebtService {
  id: number;
  series_id: number;
  payment_date: string; // YYYY-MM-DD
  principal?: number | null;
  interest?: number | null;
  created_at?: string | null;
}
