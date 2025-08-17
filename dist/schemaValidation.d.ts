import { type IdField } from "convex/server";
import { type Validator, type OptionalProperty } from "convex/values";
import * as valibot from "valibot";
export declare const CONVEX_TYPE: "_CV_T_";
export declare const CONVEX_ID_TYPE: "_CV_ID_";
export declare function convexId<T extends string>(tableName: T): valibot.SchemaWithPipe<readonly [valibot.CustomSchema<IdField<T>, undefined>, valibot.MetadataAction<IdField<T>, {
    readonly _CV_ID_: T;
}>]>;
export type AnyVSchema = valibot.BaseSchema<unknown, unknown, valibot.BaseIssue<unknown>> | valibot.BaseSchemaAsync<unknown, unknown, valibot.BaseIssue<unknown>>;
type VOut<S extends AnyVSchema> = valibot.InferOutput<S>;
type InferSchemaOutput<S> = S extends AnyVSchema ? valibot.InferOutput<S> : never;
export declare function valibotToConvex<S extends AnyVSchema>(schema: S, options?: {
    inNonNullable?: boolean;
    inNonNullish?: boolean;
    inNonOptional?: boolean;
}): Validator<VOut<S>, OptionalProperty, string>;
export declare function valibotToConvex<T extends string>(schema: {
    type: T;
    expects?: string;
}): Validator<T, OptionalProperty, string>;
type ConvexOut<S extends AnyVSchema> = S extends {
    __cv_out?: infer U;
} ? U : valibot.InferOutput<S>;
type ObjSchema = valibot.ObjectSchema<any, any>;
export type OnlyObjectOptions = readonly [ObjSchema, ...ObjSchema[]];
export type UnionTable<O extends OnlyObjectOptions> = valibot.UnionSchema<O, any> | valibot.UnionSchemaAsync<O, any>;
export type VariantTable<O extends OnlyObjectOptions> = valibot.VariantSchema<string, O, any> | valibot.VariantSchemaAsync<string, O, any>;
export type ValibotTable<O extends OnlyObjectOptions> = Record<string, AnyVSchema> | UnionTable<O> | VariantTable<O>;
export type InferValibotTable<T extends ValibotTable<OnlyObjectOptions>> = T extends Record<string, AnyVSchema> ? valibot.InferOutput<valibot.ObjectSchemaAsync<T, any>> : InferSchemaOutput<Extract<T, AnyVSchema>>;
type ConvexObjectShapeFromValibot<T extends Record<string, AnyVSchema>> = {
    [K in keyof T]: Validator<ConvexOut<T[K]>, OptionalProperty, string>;
};
export type ConvexTableDefFromValibot<T extends ValibotTable<O>, O extends OnlyObjectOptions = OnlyObjectOptions> = T extends Record<string, AnyVSchema> ? ConvexObjectShapeFromValibot<T> : T extends valibot.UnionSchema<infer U, any> ? U extends OnlyObjectOptions ? Validator<InferSchemaOutput<Extract<T, AnyVSchema>>, "required", string> : never : T extends valibot.VariantSchema<string, infer U, any> ? U extends OnlyObjectOptions ? Validator<InferSchemaOutput<Extract<T, AnyVSchema>>, "required", string> : never : never;
export declare function isValibotSchema(value: unknown): value is AnyVSchema;
export {};
//# sourceMappingURL=schemaValidation.d.ts.map