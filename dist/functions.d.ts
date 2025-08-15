import { type CustomBuilder } from "convex-helpers/server/customFunctions";
import { type OnlyObjectOptions, type ValibotTable } from "./schemaValidation";
import type { MutationBuilder, GenericMutationCtx, GenericDataModel, FunctionVisibility } from "convex/server";
export declare function secureMutation<DataModel extends GenericDataModel, Visibility extends FunctionVisibility>(schema: Record<string, ValibotTable<OnlyObjectOptions>>, mutation: MutationBuilder<DataModel, Visibility>): CustomBuilder<"mutation", {}, {
    insecureDb: GenericMutationCtx<DataModel>["db"];
    db: GenericMutationCtx<DataModel>["db"];
}, {}, GenericMutationCtx<DataModel>, Visibility, {}>;
//# sourceMappingURL=functions.d.ts.map