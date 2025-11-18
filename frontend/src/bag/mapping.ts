// Interface representing a row in TBL_DEBT_SERVICE
export interface DebtService {
    id?: number;               // corresponds to ID
    seriesId?: number;        // corresponds to SERIES_ID, optional because it may be null
    periodEndDate?: Date;     // corresponds to PERIOD_END_DATE
    principal?: number;       // corresponds to PRINCIPAL
    interest?: number;        // corresponds to INTEREST
    createdAt?: Date;         // corresponds to CREATE_AT
}

// Interface representing a row in TBL_DEBT_SERIES (for 1:many relationship)
export interface DebtServiceRows {
    debtServices?: DebtService[]; // one-to-many relationship
}


// Interface representing a row in TBL_DEBT_SERIES
export interface DebtSeries {
    id?: number;               // corresponds to ID
    seriesName?: string;      // corresponds to SERIES_NAME
    isTaxExempt?: boolean;    // corresponds to IS_TAX_EXEMPT
    createdAt?: Date;         // corresponds to CREATE_AT
    debtServices?: DebtService[]; // optional 1:many relationship
}

export interface SeriesRows {
    debtSeries?: DebtSeries[]; // one-to-many relationship
}
