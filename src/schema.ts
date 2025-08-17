import { defineTable } from "convex/server";
import {
    valibotToConvex,
    type AnyVSchema,
    type UnionTable,
    type VariantTable,
    type OnlyObjectOptions,
    type ConvexTableDefFromValibot,
} from "./schemaValidation";
import { type GenericValidator } from "convex/values";

// Fonction pour les objets Record<string, AnyVSchema> (cas le plus commun)
export function defineSecureTable<T extends Record<string, AnyVSchema>>(
    tableDefinition: T
) {
    const convexShape = Object.fromEntries(
        Object.entries(tableDefinition).map(([name, schema]) => [
            name,
            valibotToConvex(schema),
        ])
    ) as ConvexTableDefFromValibot<T, OnlyObjectOptions>;

    return defineTable(convexShape);
}

// Fonction séparée pour les unions/variants
export function defineSecureUnionTable<O extends OnlyObjectOptions>(
    tableDefinition: UnionTable<O> | VariantTable<O>
) {
    const convexValidator = valibotToConvex(tableDefinition);
    return defineTable(convexValidator as GenericValidator);
}
