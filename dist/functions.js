import { customMutation, } from "convex-helpers/server/customFunctions";
import { isValibotSchema, } from "./schemaValidation";
import * as v from "valibot";
export function secureMutation(schema, mutation) {
    return customMutation(mutation, {
        args: {},
        input: async (ctx) => {
            const secureInsert = async (tableName, data) => {
                const tableDef = schema[tableName];
                if (tableDef) {
                    const validator = isValibotSchema(tableDef)
                        ? tableDef
                        : v.objectAsync(tableDef);
                    const output = await v.parseAsync(validator, data);
                    return await ctx.db.insert(tableName, output);
                }
                return await ctx.db.insert(tableName, data);
            };
            const secureReplace = async (id, data) => {
                const tableDef = schema[id.__tableName];
                if (tableDef) {
                    const validator = isValibotSchema(tableDef)
                        ? tableDef
                        : v.objectAsync(tableDef);
                    const output = await v.parseAsync(validator, data);
                    return await ctx.db.replace(id, output);
                }
                return await ctx.db.replace(id, data);
            };
            const securePatch = async (id, data) => {
                const tableDef = schema[id.__tableName];
                if (tableDef) {
                    const keysToKeep = Object.keys(data);
                    if (keysToKeep.length === 0) {
                        return await ctx.db.patch(id, data);
                    }
                    let validator;
                    if (isValibotSchema(tableDef)) {
                        validator = v.union(tableDef.options.map((option) => v.pick(option, keysToKeep)));
                    }
                    else {
                        validator = v.pick(v.objectAsync(tableDef), keysToKeep);
                    }
                    const output = await v.parseAsync(validator, data);
                    return await ctx.db.patch(id, output);
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
