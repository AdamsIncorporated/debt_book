// Represents a debt series patch
export interface DebtSeriesPatch {
  id: number; // i64 → number
  series_name: string;
  is_tax_exempt: number; // i8 → number
  par_amount: number;
  premium: number;
  cost_of_issuance: number;
}

// Collection of debt pricing patches
export interface DebtPricingPatches {
  patches: DebtPricingPatch[];
}

// Represents a single debt pricing patch
export interface DebtPricingPatch {
  id: number;
  maturity_date: string; // YYYY-MM-DD
  amount: number;
  coupon_rate: number;
  yield_rate: number;
  price?: number | null; // optional
  premium_discount?: number | null; // optional
}

// Collection of debt service patches
export interface DebtServicePatches {
  patches: DebtServicePatch[];
}

// Represents a single debt service patch
export interface DebtServicePatch {
  id: number;
  payment_date: string; // YYYY-MM-DD
  principal: number;
  interest?: number | null; // optional
}
