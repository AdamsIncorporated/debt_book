export const DELETE_ALL_SERIES = "/api/delete/delete_all_series";
export const PATCH_DEBT_SERIES = "/api/patch/patch_debt_series";
export const PATCH_DEBT_SERVICE = "/api/patch/patch_debt_service";
export const PATCH_DEBT_PRICING = "/api/patch/patch_debt_pricing";
export const POST_DEBT_SERIES = "/api/post/post_series";
export const POST_DEBT_PRICING = "/api/post/post_debt_pricing";
export const POST_DEBT_SERVICE = "/api/post/post_debt_service";

// Represents a simple series name
export interface SeriesNameList {
  name: string;
}

// Represents a debt series
export interface DebtSeries {
  id: number | null;
  series_name: string;
  is_tax_exempt?: boolean;
  par_amount: number;
  premium?: number | null;
  cost_of_issuance?: number | null;
  created_at?: string | null; // optional timestamp string
}

// Represents debt pricing information
export interface DebtPricing {
  id: number | null;
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
  id: number | null;
  series_id: number;
  payment_date: string; // YYYY-MM-DD
  principal?: number | null;
  interest?: number | null;
  created_at?: string | null;
}
