import { DocumentByName, GenericDataModel } from "convex/server";
type Rule = {
    action: string;
    dataRequired?: boolean;
};
type BasePermission<M extends GenericDataModel> = Partial<Record<keyof M, Rule>>;
type Permission<M extends GenericDataModel, P extends BasePermission<M>> = {
    [K in keyof P & keyof M & string]: {
        action: NonNullable<P[K]>["action"];
        dataRequired?: NonNullable<P[K]>["dataRequired"];
        dataType: DocumentByName<M, K>;
    };
};
export declare function createPermixFromDataModel<D extends GenericDataModel, P extends BasePermission<D>>(): import("permix").Permix<Permission<D, P>>;
export {};
//# sourceMappingURL=permix.d.ts.map