pub const POST_STR: &str = r#"
{
  "debt_series": [
    {
      "series_name": "TEST_SERIES",
      "is_tax_exempt": true,
      "par_amount": 5000000.0,
      "premium": 125000.0,
      "cost_of_issuance": 50000.0,
      "created_at": "2026-02-16"
    }
  ],
  "debt_pricing": [
    {
      "series_id": 1,
      "maturity_date": "2031-06-01",
      "amount": 1000000.0,
      "coupon_rate": 4.5,
      "yield_rate": 4.2,
      "price": 101.25,
      "premium_discount": 12500.0,
      "created_at": "2026-02-16"
    },
    {
      "series_id": 1,
      "maturity_date": "2032-06-01",
      "amount": 1000000.0,
      "coupon_rate": 4.6,
      "yield_rate": 4.3,
      "price": 100.75,
      "premium_discount": 7500.0,
      "created_at": "2026-02-16"
    }
  ],
  "debt_service": [
    {
      "series_id": 1,
      "payment_date": "2027-06-01",
      "principal": 200000.0,
      "interest": 225000.0,
      "created_at": "2026-02-16"
    },
    {
      "series_id": 1,
      "payment_date": "2028-06-01",
      "principal": 250000.0,
      "interest": 200000.0,
      "created_at": "2026-02-16"
    }
  ]
}
"#;

pub const PATCH_STR: &str = r#"
{
  "tbl_debt_series": [
    {
      "id": 1,
      "series_name": "TEST_SERIES_UPDATED",
      "premium": 130000.0
    }
  ],
  "tbl_debt_pricing": [
    {
      "op": "update",
      "id": 1,
      "series_id": 1,
      "price": 102.0
    },
    {
      "op": "insert",
      "series_id": 1,
      "maturity_date": "2033-06-01",
      "amount": 1000000.0,
      "coupon_rate": 4.7,
      "yield_rate": 4.4,
      "price": 101.0,
      "premium_discount": 10000.0
    },
    {
      "op": "delete",
      "id": 2,
      "series_id": 1
    }
  ],
  "tbl_debt_service": [
    {
      "op": "update",
      "id": 1,
      "series_id": 1,
      "principal": 210000.0
    },
    {
      "op": "insert",
      "series_id": 1,
      "payment_date": "2029-06-01",
      "principal": 300000.0,
      "interest": 210000.0
    },
    {
      "op": "delete",
      "id": 2,
      "series_id": 1
    }
  ]
}
"#;
