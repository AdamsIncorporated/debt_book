// Represents a debt series post
export interface DebtSeriesPost {
  series_name: string;
  is_tax_exempt: number; // i8 in Rust → number in TypeScript
  par_amount: number;
  premium?: number | null;
  cost_of_issuance?: number | null;
}

// Represents a collection of debt pricing posts
export interface DebtPricingPosts {
  posts: DebtPricingPost[];
}

// Represents a single debt pricing post
export interface DebtPricingPost {
  series_id: number; // i64 in Rust → number in TypeScript
  maturity_date: string; // YYYY-MM-DD
  amount: number;
  coupon_rate: number;
  yield_rate: number;
  price: number;
  premium_discount?: number | null;
}

// Represents a collection of debt service posts
export interface DebtServicePosts {
  posts: DebtServicePost[];
}

// Represents a single debt service post
export interface DebtServicePost {
  series_id: number; // i64 → number
  payment_date: string; // YYYY-MM-DD
  principal?: number | null;
  interest?: number | null;
}
