import { defineSchema, defineTable } from "convex/server";
import { valibotToConvex, } from "./schemaValidation";
function defineSecureTable(tableDefinition) {
    const convexShape = Object.fromEntries(Object.entries(tableDefinition).map(([name, schema]) => [
        name,
        valibotToConvex(schema),
    ]));
    return defineTable(convexShape);
}
export function defineSecureSchema(schemaDef) {
    // Construction du schéma avec préservation des types
    const schema = {};
    for (const [tableName, tableDefinition] of Object.entries(schemaDef)) {
        schema[tableName] = defineSecureTable(tableDefinition);
    }
    return defineSchema(schema);
}
