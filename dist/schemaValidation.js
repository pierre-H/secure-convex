import { v, ConvexError, } from "convex/values";
import * as valibot from "valibot";
function ensureRequired(validator) {
    return validator;
}
export const CONVEX_TYPE = "_CV_T_";
export const CONVEX_ID_TYPE = "_CV_ID_";
export function convexId(tableName) {
    return valibot.pipe(valibot.custom((id) => {
        return typeof id === "string";
    }), valibot.metadata({
        [CONVEX_ID_TYPE]: tableName,
    }));
}
function uniqueUnions(...members) {
    const membersSet = new Map();
    for (const member of members) {
        membersSet.set(member.kind, member);
    }
    if (membersSet.size === 1) {
        return members[0];
    }
    return v.union(...Array.from(membersSet.values()));
}
// 4) Implémentation
export function valibotToConvex(schema, options) {
    // Si c’est un schéma Valibot (sync ou async), on regarde un éventuel tag Convex déjà présent
    if ("kind" in schema) {
        const metadata = valibot.getMetadata(schema);
        const tagged = metadata[CONVEX_TYPE];
        if (tagged) {
            return tagged;
        }
        const tableName = metadata[CONVEX_ID_TYPE];
        if (typeof tableName === "string" && tableName) {
            return v.id(tableName);
        }
    }
    switch (schema.type) {
        case "string":
            return v.string();
        case "number":
        case "nan":
            return v.number();
        case "boolean":
            return v.boolean();
        case "bigint":
            return v.int64();
        case "literal": {
            const s = schema;
            if (typeof s.literal === "symbol") {
                throw new Error("Convex doesn't support symbols as literals");
            }
            return v.literal(s.literal);
        }
        case "instance": {
            const s = schema;
            if (s.expects === "ArrayBuffer")
                return v.bytes();
            throw new ConvexError(`Unsupported instance type: ${s.expects}`);
        }
        case "null":
            return v.null();
        case "array": {
            const s = schema;
            return v.array(ensureRequired(valibotToConvex(s.item)));
        }
        case "object":
        case "strict_object": {
            const s = schema;
            const entries = Object.fromEntries(Object.entries(s.entries).map(([k, sub]) => [
                k,
                valibotToConvex(sub),
            ]));
            return v.object(entries);
        }
        case "record": {
            const s = schema;
            return v.record(v.string(), ensureRequired(valibotToConvex(s.value)));
        }
        case "union": {
            const s = schema;
            return uniqueUnions(...s.options.map((opt) => ensureRequired(valibotToConvex(opt))));
        }
        case "optional":
        case "undefinedable": {
            const s = schema;
            if (options?.inNonOptional) {
                return ensureRequired(valibotToConvex(s.wrapped));
            }
            // Tu unwrappes le top-level optional (cohérent avec Convex)
            return v.optional(valibotToConvex(s.wrapped));
        }
        case "non_optional": {
            const s = schema;
            return valibotToConvex(s.wrapped, { inNonOptional: true });
        }
        case "nullable": {
            const s = schema;
            if (options?.inNonNullable) {
                return ensureRequired(valibotToConvex(s.wrapped));
            }
            return v.union(v.null(), ensureRequired(valibotToConvex(s.wrapped)));
        }
        case "non_nullable": {
            const s = schema;
            return valibotToConvex(s.wrapped, { inNonNullable: true });
        }
        case "nullish": {
            const s = schema;
            if (options?.inNonNullish) {
                return ensureRequired(valibotToConvex(s.wrapped));
            }
            return v.optional(v.union(v.null(), ensureRequired(valibotToConvex(s.wrapped))));
        }
        case "non_nullish": {
            const s = schema;
            return valibotToConvex(s.wrapped, { inNonNullish: true });
        }
        case "blob": {
            throw new ConvexError("Blob is not supported: store the file in the Convex storage.");
        }
        case "file": {
            throw new ConvexError("File is not supported: store the file in the Convex storage.");
        }
        case "date": {
            throw new ConvexError("Date can be saved in Convex either as a string or as a number.");
        }
        case "enum": {
            return v.union(...schema.options.map((option) => v.literal(option)));
        }
        case "picklist": {
            return v.union(...schema.options.map((option) => v.literal(option)));
        }
        case "exact_optional": {
            return valibotToConvex({
                type: schema.type,
            });
        }
        case "function": {
            throw new ConvexError("Function is not supported.");
        }
        case "intersect": {
            throw new ConvexError("Not supported : use object merging.");
        }
        case "lazy": {
            throw new ConvexError("Lazy schemas are not supported.");
        }
        case "never": {
            throw new ConvexError("Never is not supported.");
        }
        case "promise": {
            throw new ConvexError("Promise is not supported.");
        }
        case "undefined": {
            return v.optional(v.any());
        }
        case "variant": {
            return v.union(...schema.options.map((option) => ensureRequired(valibotToConvex(option))));
        }
        case "void": {
            throw new ConvexError("Void schema is not supported.");
        }
    }
    return v.any();
}
export function isValibotSchema(value) {
    return (!!value &&
        typeof value === "object" &&
        value.kind === "schema" &&
        typeof value["~run"] === "function");
}
