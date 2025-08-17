import { defineTable } from "convex/server";
import {
    valibotToConvex,
    type ValibotTable,
    type OnlyObjectOptions,
    type ConvexTableDefFromValibot,
} from "./schemaValidation";

export function defineSecureTable<
    T extends ValibotTable<O>,
    O extends OnlyObjectOptions,
>(tableDefinition: T) {
    const convexShape = Object.fromEntries(
        Object.entries(tableDefinition).map(([name, schema]) => [
            name,
            valibotToConvex(schema),
        ])
    ) as ConvexTableDefFromValibot<T, O>;

    return defineTable(convexShape);
}
