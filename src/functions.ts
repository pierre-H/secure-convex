import {
    customMutation,
    type CustomBuilder,
} from "convex-helpers/server/customFunctions";
import {
    isValibotSchema,
    type AnyVSchema,
    type OnlyObjectOptions,
    type ValibotTable,
    type UnionTable,
} from "./schemaValidation";
import type {
    MutationBuilder,
    GenericMutationCtx,
    GenericDataModel,
    FunctionVisibility,
} from "convex/server";
import * as v from "valibot";

export function secureMutation<
    DataModel extends GenericDataModel,
    Visibility extends FunctionVisibility,
>(
    schema: Record<string, ValibotTable<OnlyObjectOptions>>,
    mutation: MutationBuilder<DataModel, Visibility>
): CustomBuilder<
    "mutation",
    {},
    {
        insecureDb: GenericMutationCtx<DataModel>["db"];
        db: GenericMutationCtx<DataModel>["db"];
    },
    {},
    GenericMutationCtx<DataModel>,
    Visibility,
    {}
> {
    return customMutation(mutation, {
        args: {},
        input: async (ctx) => {
            const secureInsert: typeof ctx.db.insert = async (
                tableName,
                data
            ) => {
                const tableDef = schema[tableName as string];

                if (tableDef) {
                    const validator = isValibotSchema(tableDef)
                        ? tableDef
                        : v.objectAsync(tableDef as Record<string, AnyVSchema>);

                    const output = await v.parseAsync(validator, data);

                    return await ctx.db.insert(tableName, output as any);
                }

                return await ctx.db.insert(tableName, data);
            };

            const secureReplace: typeof ctx.db.replace = async (id, data) => {
                const tableDef = schema[id.__tableName as string];

                if (tableDef) {
                    const validator = isValibotSchema(tableDef)
                        ? tableDef
                        : v.objectAsync(tableDef as Record<string, AnyVSchema>);

                    const output = await v.parseAsync(validator, data);

                    return await ctx.db.replace(id, output as any);
                }

                return await ctx.db.replace(id, data);
            };

            const securePatch: typeof ctx.db.patch = async (id, data) => {
                const tableDef = schema[id.__tableName as string];

                if (tableDef) {
                    const keysToKeep = Object.keys(data);

                    if (keysToKeep.length === 0) {
                        return await ctx.db.patch(id, data);
                    }

                    let validator: AnyVSchema;

                    if (isValibotSchema(tableDef)) {
                        validator = v.union(
                            (
                                tableDef as UnionTable<OnlyObjectOptions>
                            ).options.map((option) =>
                                v.pick(
                                    option,
                                    keysToKeep as [string, ...string[]]
                                )
                            )
                        );
                    } else {
                        validator = v.pick(
                            v.objectAsync(
                                tableDef as Record<string, AnyVSchema>
                            ),
                            keysToKeep as [string, ...string[]]
                        );
                    }

                    const output = await v.parseAsync(validator, data);

                    return await ctx.db.patch(id, output as any);
                }

                return await ctx.db.patch(id, data);
            };

            const newCtx = {
                insecureDb: ctx.db,
                db: {
                    ...ctx.db,
                    insert: secureInsert,
                    replace: secureReplace,
                    patch: securePatch,
                },
            };

            return {
                ctx: newCtx,
                args: {},
            };
        },
    });
}
