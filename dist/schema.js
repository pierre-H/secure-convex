import { defineTable } from "convex/server";
import { valibotToConvex, } from "./schemaValidation";
export function defineSecureTable(tableDefinition) {
    const convexShape = Object.fromEntries(Object.entries(tableDefinition).map(([name, schema]) => [
        name,
        valibotToConvex(schema),
    ]));
    return defineTable(convexShape);
}
