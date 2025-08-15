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
export type UnionTable<O extends OnlyObjectOptions> = valibot.UnionSchema<O, any>;
export type ValibotTable<O extends OnlyObjectOptions> = Record<string, AnyVSchema> | UnionTable<O>;
type ConvexObjectShapeFromValibot<T extends Record<string, AnyVSchema>> = {
    [K in keyof T]: Validator<ConvexOut<T[K]>, OptionalProperty, string>;
};
export type ConvexTableDefFromValibot<T extends ValibotTable<O>, O extends OnlyObjectOptions = OnlyObjectOptions> = T extends Record<string, AnyVSchema> ? ConvexObjectShapeFromValibot<T> : T extends valibot.UnionSchema<infer U, any> ? U extends OnlyObjectOptions ? Validator<valibot.InferOutput<T>, "required", string> : never : never;
export declare function isValibotSchema(value: unknown): value is AnyVSchema;
export {};
//# sourceMappingURL=schemaValidation.d.ts.map