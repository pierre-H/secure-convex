import { defineSchema, defineTable } from "convex/server";
import {
    valibotToConvex,
    type ValibotTable,
    type OnlyObjectOptions,
    type ConvexTableDefFromValibot,
} from "./schemaValidation";

function defineSecureTable<
    T extends ValibotTable<O>,
    O extends OnlyObjectOptions,
>(tableDefinition: T) {
    const convexShape = Object.fromEntries(
        Object.entries(tableDefinition).map(([name, schema]) => [
            name,
            valibotToConvex(schema),
        ])
    );
    return defineTable(convexShape as ConvexTableDefFromValibot<T, O>);
}

export function defineSecureSchema<
    T extends Record<string, ValibotTable<OnlyObjectOptions>>,
>(schemaDef: T) {
    // Construction du schéma avec préservation des types
    const schema: Record<string, ReturnType<typeof defineSecureTable>> = {};

    for (const [tableName, tableDefinition] of Object.entries(schemaDef)) {
        schema[tableName] = defineSecureTable(tableDefinition);
    }

    return defineSchema(
        schema as {
            [K in keyof T]: ReturnType<
                typeof defineSecureTable<T[K], OnlyObjectOptions>
            >;
        }
    );
}
