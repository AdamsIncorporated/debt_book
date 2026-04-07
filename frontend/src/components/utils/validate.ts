import { DebtSeries, DebtPricing, DebtService } from "../Constants/Constants";

export const validateDebtSeries = (
  batch: DebtSeries,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!batch.series_name.trim()) {
    errors.push("Series Name is required.");
  }

  if (!batch.par_amount || Number(batch.par_amount) <= 0) {
    errors.push("Par Amount must be greater than 0.");
  }

  if (Number(batch.premium) < 0) {
    errors.push("Premium cannot be negative.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export function validateDebtServiceBatch(batch: DebtService[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // TRACKER: Prevent duplicate payment_date values within this uploaded batch
  const seenDates = new Set<string>();

  for (const item of batch) {
    // ---------------------------------------------------------
    // 1. Uniqueness: payment_date must not repeat in uploaded file
    // ---------------------------------------------------------
    if (seenDates.has(item.payment_date)) {
      errors.push(
        `Duplicate payment_date "${item.payment_date}" found in uploaded file. Each payment date must be unique.`,
      );
    } else {
      seenDates.add(item.payment_date);
    }

    // ---------------------------------------------------------
    // 2. Numeric validation: principal & interest (optional)
    // ---------------------------------------------------------
    const optionalNumericFields = ["principal", "interest"] as const;

    for (const field of optionalNumericFields) {
      const value = item[field];

      if (value !== null && value !== undefined) {
        if (typeof value !== "number" || isNaN(value)) {
          errors.push(`${field} must be a number or null.`);
        } else if (value < 0) {
          errors.push(`${field} cannot be negative.`);
        }
      }
    }

    // ---------------------------------------------------------
    // 3. Validate payment_date format (YYYY-MM-DD)
    // ---------------------------------------------------------
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.payment_date)) {
      errors.push(
        `Invalid date format for payment_date: "${item.payment_date}". Expected YYYY-MM-DD.`,
      );
    }

    // ---------------------------------------------------------
    // 4. Optional created_at must be a valid date if present
    // ---------------------------------------------------------
    if (item.created_at) {
      const d = new Date(item.created_at);
      if (isNaN(d.getTime())) {
        errors.push(
          `created_at "${item.created_at}" is not a valid date string.`,
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateDebtPricingBatch(batch: DebtPricing[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // TRACKER: Prevent duplicate maturity dates within uploaded file
  const seenMaturities = new Set<string>();

  for (const item of batch) {
    // ---------------------------------------------------------
    // 1. Uniqueness: maturity_date must not repeat in this batch
    // ---------------------------------------------------------
    if (seenMaturities.has(item.maturity_date)) {
      errors.push(
        `Duplicate maturity_date "${item.maturity_date}" found in uploaded file. Each maturity date must be unique.`,
      );
    } else {
      seenMaturities.add(item.maturity_date);
    }

    // ---------------------------------------------------------
    // 2. Numeric validation (required fields)
    // ---------------------------------------------------------
    const numericFields = [
      "amount",
      "coupon_rate",
      "yield_rate",
      "price",
    ] as const;

    for (const field of numericFields) {
      if (typeof item[field] !== "number" || isNaN(item[field])) {
        errors.push(`${field} must be a valid number.`);
      } else if (item[field] < 0) {
        errors.push(`${field} cannot be negative.`);
      }
    }

    // ---------------------------------------------------------
    // 3. Optional numeric: premium_discount
    // ---------------------------------------------------------
    if (
      item.premium_discount !== null &&
      item.premium_discount !== undefined &&
      typeof item.premium_discount !== "number"
    ) {
      errors.push(`premium_discount must be a number or null.`);
    }

    // ---------------------------------------------------------
    // 4. Validate date format (YYYY-MM-DD)
    // ---------------------------------------------------------
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.maturity_date)) {
      errors.push(
        `Invalid date format for maturity_date: "${item.maturity_date}". Expected YYYY-MM-DD.`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
