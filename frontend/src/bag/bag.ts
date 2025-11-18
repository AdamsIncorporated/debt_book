import { mapToDbRow } from "./mapping";

type operation = "create" | "read" | "update" | "delete";
type table = "TBL_DEBT_SERIES" | "TBL_DEBT_SERVICE";

interface BagItem {
    action: operation;
    tableName: table;
    row: Record<string, any>;
}

interface Bag<T> {
    items: BagItem[];
}

// Generic function to add rows to the bag
export function addCreateRowsToBag<T>(
    bag: Bag<T>,
    tableName: table,
    rows: T[],
    columnMap: Record<keyof T, string>,
    action: operation = "create"
) {
    for (const row of rows) {
        bag.items.push({
            action,
            tableName: tableName,
            row: mapToDbRow(row, columnMap),
        });
    }
}

export function addUpdateRowsToBag<T>(
    bag: Bag<T>,
    tableName: table,
    rows: T[],
    columnMap: Record<keyof T, string>,
    action: operation = "update"
) {
    for (const row of rows) {
        bag.items.push({
            action,
            tableName: tableName,
            row: mapToDbRow(row, columnMap),
        });
    }
}

export function addDeleteRowsToBag<T>(
    bag: Bag<T>,
    tableName: table,
    rows: T[],
    columnMap: Record<keyof T, string>,
    action: operation = "delete"
) {
    for (const row of rows) {
        bag.items.push({
            action,
            tableName: tableName,
            row: mapToDbRow(row, columnMap),
        });
    }
}

export function addReadRowsToBag<T>(
    bag: Bag<T>,
    tableName: table,
    rows: T[],
    columnMap: Record<keyof T, string>,
    action: operation = "read"
) {
    for (const row of rows) {
        bag.items.push({
            action,
            tableName: tableName,
            row: mapToDbRow(row, columnMap),
        });
    }
}