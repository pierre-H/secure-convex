import { defineTable } from "convex/server";
import { valibotToConvex, } from "./schemaValidation";
// Fonction pour les objets Record<string, AnyVSchema> (cas le plus commun)
export function defineSecureTable(tableDefinition) {
    const convexShape = Object.fromEntries(Object.entries(tableDefinition).map(([name, schema]) => [
        name,
        valibotToConvex(schema),
    ]));
    return defineTable(convexShape);
}
// Fonction séparée pour les unions/variants
export function defineSecureUnionTable(tableDefinition) {
    const convexValidator = valibotToConvex(tableDefinition);
    return defineTable(convexValidator);
}
