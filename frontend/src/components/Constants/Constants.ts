export const GET_ALL_SERIES = "/api/get/get_all_series";
export const getSeriesIdByName = (seriesName: string) =>
  `/api/get/get_series_id_by_name?series_name=${encodeURIComponent(seriesName)}`;
export const GET_SERIES_BY_ID = "/api/get/get_debt_series_by_id/";
export const getSeriesPricingById = (id: number) =>
  `/api/get/get_debt_series_pricing_by_id/${id}`;
export const getSeriesDebtServiceById = (id: number) =>
  `/api/get/get_debt_series_service_by_id/${id}`;
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
  structure: string;
  is_tax_exempt?: number;
  cost_of_issuance?: number | null;
  use_of_proceeds: string;
  created_at?: string | null;
}

// Represents debt pricing information
export interface DebtPricing {
  id: number | null;
  series_id: number | null;
  maturity_date: string;
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
  series_id: number | null;
  payment_date: string;
  principal?: number | null;
  interest?: number | null;
  created_at?: string | null;
}

export const STRUCTURE_OPTIONS = [
  // Maturity structure
  "Serial Bonds",
  "Term Bonds",
  "Serial + Term (Combination)",

  // Interest / accretion structure
  "Capital Appreciation (Zero-Coupon)",
  "Current Interest",

  // Rate mode
  "Fixed Rate",
  "Variable Rate (VRDO)",
];

export const USE_OF_PROCEEDS_OPTIONS = [
  "New Money – Capital Project / Infrastructure",
  "Refunding / Refinancing Outstanding Bonds (Current or Advance)",
  "Working Capital / Operating Needs",
  "Acquisition (Land / Facilities)",
  "Construction / Renovation",
  "Equipment",
  "Debt Service Reserve Funding",
  "Costs of Issuance",
  "Other",
];
