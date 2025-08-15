import { defineTable, type IdField } from "convex/server";
import {
    v,
    type Validator,
    type OptionalProperty,
    ConvexError,
    type VUnion,
} from "convex/values";
import * as valibot from "valibot";

function ensureRequired<T>(
    validator: Validator<T, OptionalProperty, string>
): Validator<T, "required", string> {
    return validator as unknown as Validator<T, "required", string>;
}

export const CONVEX_TYPE = "_CV_T_" as const;
export const CONVEX_ID_TYPE = "_CV_ID_" as const;

export function convexId<T extends string>(tableName: T) {
    return valibot.pipe(
        valibot.custom<IdField<T>>((id) => {
            return typeof id === "string";
        }),
        valibot.metadata({
            [CONVEX_ID_TYPE]: tableName,
        })
    );
}

// 1) Tous les schémas valibot possibles (sync + async)
export type AnyVSchema =
    | valibot.BaseSchema<unknown, unknown, valibot.BaseIssue<unknown>>
    | valibot.BaseSchemaAsync<unknown, unknown, valibot.BaseIssue<unknown>>;

type VOut<S extends AnyVSchema> = valibot.InferOutput<S>;

// 2) Aides “structurales” (pas de `any`, pas besoin d’*Async* spécifiques)
type SchemaOf<T extends string, Extra extends object = object> = AnyVSchema & {
    type: T;
} & Extra;

type InstanceLike = SchemaOf<"instance", { expects?: string }>;
type LiteralLike = SchemaOf<"literal", { literal: valibot.Literal }>;

type ArrayLike = SchemaOf<"array", { item: AnyVSchema }>;
type ObjectLike = SchemaOf<"object", { entries: Record<string, AnyVSchema> }>;
type RecordLike = SchemaOf<
    "record",
    { /* key?: AnyVSchema (ignoré ici) */ value: AnyVSchema }
>;
type UnionLike = SchemaOf<"union", { options: ReadonlyArray<AnyVSchema> }>;
type OptionalLike = SchemaOf<"optional", { wrapped: AnyVSchema }>;
type NonOptionalLike = SchemaOf<"non_optional", { wrapped: AnyVSchema }>;
type NullableLike = SchemaOf<"nullable", { wrapped: AnyVSchema }>;
type NonNullableLike = SchemaOf<"non_nullable", { wrapped: AnyVSchema }>;
type NullishLike = SchemaOf<"nullish", { wrapped: AnyVSchema }>;
type NonNullishLike = SchemaOf<"non_nullish", { wrapped: AnyVSchema }>;

function uniqueUnions<T extends Validator<unknown, "required", string>>(
    ...members: T[]
): T | VUnion<T["type"], T[], "required", T["fieldPaths"]> {
    const membersSet = new Map<string, T>();

    for (const member of members) {
        membersSet.set(member.kind, member);
    }

    if (membersSet.size === 1) {
        return members[0]!;
    }

    return v.union(...Array.from(membersSet.values()));
}

// 3) Overloads
export function valibotToConvex<S extends AnyVSchema>(
    schema: S,
    options?: {
        inNonNullable?: boolean;
        inNonNullish?: boolean;
        inNonOptional?: boolean;
    }
): Validator<VOut<S>, OptionalProperty, string>;

export function valibotToConvex<T extends string>(schema: {
    type: T;
    expects?: string;
}): Validator<T, OptionalProperty, string>;

// 4) Implémentation
export function valibotToConvex(
    schema: AnyVSchema | { type: string; expects?: string },
    options?: {
        inNonNullable?: boolean;
        inNonNullish?: boolean;
        inNonOptional?: boolean;
    }
): Validator<unknown, OptionalProperty, string> {
    // Si c’est un schéma Valibot (sync ou async), on regarde un éventuel tag Convex déjà présent
    if ("kind" in (schema as AnyVSchema)) {
        const metadata = valibot.getMetadata(schema as AnyVSchema);
        const tagged = (metadata as Record<string, unknown>)[CONVEX_TYPE];
        if (tagged) {
            return tagged as Validator<unknown, OptionalProperty, string>;
        }

        const tableName = (metadata as Record<string, unknown>)[CONVEX_ID_TYPE];
        if (typeof tableName === "string" && tableName) {
            return v.id(tableName);
        }
    }

    switch ((schema as { type?: string }).type) {
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
            const s = schema as LiteralLike;
            if (typeof s.literal === "symbol") {
                throw new Error("Convex doesn't support symbols as literals");
            }
            return v.literal(s.literal);
        }

        case "instance": {
            const s = schema as InstanceLike;
            if (s.expects === "ArrayBuffer") return v.bytes();
            throw new ConvexError(`Unsupported instance type: ${s.expects}`);
        }

        case "null":
            return v.null();

        case "array": {
            const s = schema as ArrayLike;
            return v.array(ensureRequired(valibotToConvex(s.item)));
        }

        case "object":
        case "strict_object": {
            const s = schema as ObjectLike;
            const entries = Object.fromEntries(
                Object.entries(s.entries).map(([k, sub]) => [
                    k,
                    valibotToConvex(sub),
                ])
            );
            return v.object(entries);
        }

        case "record": {
            const s = schema as RecordLike;
            return v.record(
                v.string(),
                ensureRequired(valibotToConvex(s.value))
            );
        }

        case "union": {
            const s = schema as UnionLike;
            return uniqueUnions(
                ...s.options.map((opt) => ensureRequired(valibotToConvex(opt)))
            );
        }

        case "optional":
        case "undefinedable": {
            const s = schema as OptionalLike;

            if (options?.inNonOptional) {
                return ensureRequired(valibotToConvex(s.wrapped));
            }

            // Tu unwrappes le top-level optional (cohérent avec Convex)
            return v.optional(valibotToConvex(s.wrapped));
        }

        case "non_optional": {
            const s = schema as NonOptionalLike;
            return valibotToConvex(s.wrapped, { inNonOptional: true });
        }

        case "nullable": {
            const s = schema as NullableLike;

            if (options?.inNonNullable) {
                return ensureRequired(valibotToConvex(s.wrapped));
            }

            return v.union(
                v.null(),
                ensureRequired(valibotToConvex(s.wrapped))
            );
        }

        case "non_nullable": {
            const s = schema as NonNullableLike;
            return valibotToConvex(s.wrapped, { inNonNullable: true });
        }

        case "nullish": {
            const s = schema as NullishLike;

            if (options?.inNonNullish) {
                return ensureRequired(valibotToConvex(s.wrapped));
            }

            return v.optional(
                v.union(v.null(), ensureRequired(valibotToConvex(s.wrapped)))
            );
        }

        case "non_nullish": {
            const s = schema as NonNullishLike;
            return valibotToConvex(s.wrapped, { inNonNullish: true });
        }

        case "blob": {
            throw new ConvexError(
                "Blob is not supported: store the file in the Convex storage."
            );
        }
        case "file": {
            throw new ConvexError(
                "File is not supported: store the file in the Convex storage."
            );
        }

        case "date": {
            throw new ConvexError(
                "Date can be saved in Convex either as a string or as a number."
            );
        }

        case "enum": {
            return v.union(
                ...(
                    schema as valibot.EnumSchema<valibot.Enum, never>
                ).options.map((option) => v.literal(option))
            );
        }
        case "picklist": {
            return v.union(
                ...(
                    schema as valibot.PicklistSchema<
                        valibot.PicklistOptions,
                        never
                    >
                ).options.map((option) => v.literal(option))
            );
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
            return v.union(
                ...(
                    schema as valibot.VariantSchema<
                        string,
                        valibot.VariantOptions<string>,
                        never
                    >
                ).options.map((option) =>
                    ensureRequired(valibotToConvex(option))
                )
            );
        }
        case "void": {
            throw new ConvexError("Void schema is not supported.");
        }
    }

    return v.any();
}

type ConvexOut<S extends AnyVSchema> = S extends { __cv_out?: infer U }
    ? U
    : valibot.InferOutput<S>;

type ObjSchema = valibot.ObjectSchema<any, any>;

// Tuple non vide de schémas d'objets uniquement
export type OnlyObjectOptions = readonly [ObjSchema, ...ObjSchema[]];

export type UnionTable<O extends OnlyObjectOptions> = valibot.UnionSchema<
    O,
    any
>;

export type ValibotTable<O extends OnlyObjectOptions> =
    | Record<string, AnyVSchema>
    | UnionTable<O>;

type ConvexObjectShapeFromValibot<T extends Record<string, AnyVSchema>> = {
    [K in keyof T]: Validator<ConvexOut<T[K]>, OptionalProperty, string>;
};

export type ConvexTableDefFromValibot<
    T extends ValibotTable<O>,
    O extends OnlyObjectOptions = OnlyObjectOptions,
> =
    T extends Record<string, AnyVSchema>
        ? ConvexObjectShapeFromValibot<T>
        : T extends valibot.UnionSchema<infer U, any>
          ? U extends OnlyObjectOptions
              ? Validator<valibot.InferOutput<T>, "required", string>
              : never
          : never;

export function isValibotSchema(value: unknown): value is AnyVSchema {
    return (
        !!value &&
        typeof value === "object" &&
        (value as any).kind === "schema" &&
        typeof (value as any)["~run"] === "function"
    );
}
