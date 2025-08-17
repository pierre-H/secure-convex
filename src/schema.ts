import { defineTable, TableDefinition } from "convex/server";
import {
    valibotToConvex,
    type ValibotTable,
    type OnlyObjectOptions,
    type ConvexTableDefFromValibot,
} from "./schemaValidation";

export function defineSecureTable<
    T extends ValibotTable<O>,
    O extends OnlyObjectOptions,
>(tableDefinition: T): TableDefinition {
    const convexShape = Object.fromEntries(
        Object.entries(tableDefinition).map(([name, schema]) => [
            name,
            valibotToConvex(schema),
        ])
    );
    return defineTable(convexShape as ConvexTableDefFromValibot<T, O>);
}
