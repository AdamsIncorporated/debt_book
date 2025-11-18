// Interface representing a row in TBL_DEBT_SERVICE
export interface DebtService {
    id?: number;               // corresponds to ID
    seriesId?: number;        // corresponds to SERIES_ID, optional because it may be null
    periodEndDate?: Date;     // corresponds to PERIOD_END_DATE
    principal?: number;       // corresponds to PRINCIPAL
    interest?: number;        // corresponds to INTEREST
    createdAt?: Date;         // corresponds to CREATE_AT
}

// Mapping for DebtService
export const DebtServiceColumnMap: Record<keyof DebtService, string> = {
    id: "ID",
    seriesId: "SERIES_ID",
    periodEndDate: "PERIOD_END_DATE",
    principal: "PRINCIPAL",
    interest: "INTEREST",
    createdAt: "CREATED_AT",
};

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
}

// Mapping for DebtSeries
export const DebtSeriesColumnMap: Record<keyof DebtSeries, string> = {
    id: "ID",
    seriesName: "SERIES_NAME",
    isTaxExempt: "IS_TAX_EXEMPT",
    createdAt: "CREATED_AT",
};

export function mapToDbRow<T>(obj: T, columnMap: Record<string, string>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(columnMap)) {
        result[value] = obj[key as keyof T];
    }
    return result;
}
