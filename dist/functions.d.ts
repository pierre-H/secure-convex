import { type CustomBuilder } from "convex-helpers/server/customFunctions";
import { type OnlyObjectOptions, type ValibotTable } from "./schemaValidation";
import type { MutationBuilder, GenericMutationCtx, GenericDataModel, FunctionVisibility } from "convex/server";
export declare function secureMutation<S extends Record<keyof DataModel, ValibotTable<OnlyObjectOptions>>, DataModel extends GenericDataModel = GenericDataModel, Visibility extends FunctionVisibility = "public">(schema: S, mutation: MutationBuilder<DataModel, Visibility>): CustomBuilder<"mutation", {}, {
    insecureDb: GenericMutationCtx<DataModel>["db"];
    db: GenericMutationCtx<DataModel>["db"];
}, {}, GenericMutationCtx<DataModel>, Visibility, {}>;
//# sourceMappingURL=functions.d.ts.map