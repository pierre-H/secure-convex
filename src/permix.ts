import { DocumentByName, GenericDataModel } from "convex/server";
import { createPermix } from "permix";

type Rule = {
    action: string;
    dataRequired?: boolean;
};

type BasePermission<M extends GenericDataModel> = Partial<
    Record<keyof M, Rule>
>;

type Permission<M extends GenericDataModel, P extends BasePermission<M>> = {
    [K in keyof P & keyof M & string]: {
        action: NonNullable<P[K]>["action"];
        dataRequired?: NonNullable<P[K]>["dataRequired"];
        dataType: DocumentByName<M, K>;
    };
};

export function createPermixFromDataModel<
    D extends GenericDataModel,
    P extends BasePermission<D>,
>() {
    return createPermix<Permission<D, P>>();
}
