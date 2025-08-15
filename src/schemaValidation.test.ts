import { describe, it, expect } from "vitest";
import { ConvexError } from "convex/values";
import * as valibot from "valibot";
import { valibotToConvex, convexId } from "./schemaValidation";

describe("valibotToConvex", () => {
    describe("primitive types", () => {
        it("should convert string schema", () => {
            const schema = valibot.string();
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("string");
            expect((result as any).isOptional).toBe("required");
        });

        it("should convert number schema", () => {
            const schema = valibot.number();
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("float64");
            expect((result as any).isOptional).toBe("required");
        });

        it("should convert nan schema", () => {
            const schema = valibot.nan();
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("float64");
            expect((result as any).isOptional).toBe("required");
        });

        it("should convert boolean schema", () => {
            const schema = valibot.boolean();
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("boolean");
            expect((result as any).isOptional).toBe("required");
        });

        it("should convert bigint schema", () => {
            const schema = valibot.bigint();
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("int64");
            expect((result as any).isOptional).toBe("required");
        });

        it("should convert null schema", () => {
            const schema = valibot.null_();
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("null");
            expect((result as any).isOptional).toBe("required");
        });
    });

    describe("literal types", () => {
        it("should convert string literal", () => {
            const schema = valibot.literal("test");
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("literal");
            expect((result as any).value).toBe("test");
        });

        it("should convert number literal", () => {
            const schema = valibot.literal(42);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("literal");
            expect((result as any).value).toBe(42);
        });

        it("should convert boolean literal", () => {
            const schema = valibot.literal(true);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("literal");
            expect((result as any).value).toBe(true);
        });

        it("should convert false boolean literal", () => {
            const schema = valibot.literal(false);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("literal");
            expect((result as any).value).toBe(false);
        });

        it("should convert bigint literal", () => {
            const schema = valibot.literal(123n);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("literal");
            expect((result as any).value).toBe(123n);
        });

        it("should convert zero number literal", () => {
            const schema = valibot.literal(0);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("literal");
            expect((result as any).value).toBe(0);
        });

        it("should convert negative number literal", () => {
            const schema = valibot.literal(-123);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("literal");
            expect((result as any).value).toBe(-123);
        });

        it("should convert float literal", () => {
            const schema = valibot.literal(3.14);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("literal");
            expect((result as any).value).toBe(3.14);
        });

        it("should convert empty string literal", () => {
            const schema = valibot.literal("");
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("literal");
            expect((result as any).value).toBe("");
        });

        it("should throw error for symbol literal", () => {
            const schema = { type: "literal", literal: Symbol("test") } as any;
            expect(() => valibotToConvex(schema)).toThrow(
                "Convex doesn't support symbols as literals"
            );
        });
    });

    describe("instance types", () => {
        it("should convert ArrayBuffer instance", () => {
            const schema = valibot.instance(ArrayBuffer);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("bytes");
        });

        it("should throw error for unsupported instance", () => {
            const schema = { type: "instance", expects: "Date" } as any;
            expect(() => valibotToConvex(schema)).toThrow(
                "Unsupported instance type: Date"
            );
        });
    });

    describe("convex id types", () => {
        it("should convert convexId schema", () => {
            const schema = convexId("users");
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("id");
            expect((result as any).tableName).toBe("users");
            expect((result as any).isOptional).toBe("required");
        });

        it("should convert convexId with different table names", () => {
            const schema = convexId("products");
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("id");
            expect((result as any).tableName).toBe("products");
            expect((result as any).isOptional).toBe("required");
        });

        it("should convert convexId with camelCase table name", () => {
            const schema = convexId("userProfiles");
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("id");
            expect((result as any).tableName).toBe("userProfiles");
            expect((result as any).isOptional).toBe("required");
        });

        it("should convert convexId with snake_case table name", () => {
            const schema = convexId("user_profiles");
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("id");
            expect((result as any).tableName).toBe("user_profiles");
            expect((result as any).isOptional).toBe("required");
        });

        it("should convert optional convexId", () => {
            const schema = valibot.optional(convexId("orders"));
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("id");
            expect((result as any).tableName).toBe("orders");
            expect((result as any).isOptional).toBe("optional");
        });

        it("should convert convexId in object fields", () => {
            const schema = valibot.object({
                id: convexId("users"),
                name: valibot.string(),
                parentId: valibot.optional(convexId("users")),
                categoryId: convexId("categories"),
            });
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("object");
            expect((result as any).isOptional).toBe("required");

            // Check id field
            expect((result as any).fields.id.kind).toBe("id");
            expect((result as any).fields.id.tableName).toBe("users");
            expect((result as any).fields.id.isOptional).toBe("required");

            // Check name field
            expect((result as any).fields.name.kind).toBe("string");
            expect((result as any).fields.name.isOptional).toBe("required");

            // Check optional parentId field
            expect((result as any).fields.parentId.kind).toBe("id");
            expect((result as any).fields.parentId.tableName).toBe("users");
            expect((result as any).fields.parentId.isOptional).toBe("optional");

            // Check categoryId field
            expect((result as any).fields.categoryId.kind).toBe("id");
            expect((result as any).fields.categoryId.tableName).toBe(
                "categories"
            );
            expect((result as any).fields.categoryId.isOptional).toBe(
                "required"
            );
        });

        it("should convert array of convexIds", () => {
            const schema = valibot.array(convexId("tags"));
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("array");
            expect((result as any).isOptional).toBe("required");
            expect((result as any).element.kind).toBe("id");
            expect((result as any).element.tableName).toBe("tags");
            expect((result as any).element.isOptional).toBe("required");
        });

        it("should convert record with convexId values", () => {
            const schema = valibot.record(valibot.string(), convexId("items"));
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("record");
            expect((result as any).isOptional).toBe("required");
            expect((result as any).key.kind).toBe("string");
            expect((result as any).key.isOptional).toBe("required");
            expect((result as any).value.kind).toBe("id");
            expect((result as any).value.tableName).toBe("items");
            expect((result as any).value.isOptional).toBe("required");
        });

        it("should convert union with convexIds", () => {
            const schema = valibot.union([
                convexId("users"),
                convexId("admins"),
            ]);
            const result = valibotToConvex(schema);
            // uniqueUnions deduplicates by kind, so two IDs become one
            expect(result.kind).toBe("id");
            expect((result as any).isOptional).toBe("required");
            // The tableName will be from one of the IDs (depends on processing order)
            expect(["users", "admins"]).toContain((result as any).tableName);
        });

        it("should convert mixed union with convexId and primitives", () => {
            const schema = valibot.union([
                valibot.string(),
                convexId("references"),
            ]);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("union");
            expect((result as any).members).toHaveLength(2);
            expect((result as any).members[0].kind).toBe("string");
            expect((result as any).members[1].kind).toBe("id");
            expect((result as any).members[1].tableName).toBe("references");
        });
    });

    describe("array types", () => {
        it("should convert array schema", () => {
            const schema = valibot.array(valibot.string());
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("array");
            expect((result as any).isOptional).toBe("required");
            expect((result as any).element.kind).toBe("string");
            expect((result as any).element.isOptional).toBe("required");
        });

        it("should convert array of numbers", () => {
            const schema = valibot.array(valibot.number());
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("array");
            expect((result as any).element.kind).toBe("float64");
        });

        it("should convert array of objects", () => {
            const schema = valibot.array(
                valibot.object({
                    id: valibot.number(),
                    name: valibot.string(),
                })
            );
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("array");
            expect((result as any).element.kind).toBe("object");
            expect((result as any).element.fields.id.kind).toBe("float64");
            expect((result as any).element.fields.name.kind).toBe("string");
        });

        it("should convert array of unions", () => {
            const schema = valibot.array(
                valibot.union([valibot.string(), valibot.number()])
            );
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("array");
            expect((result as any).element.kind).toBe("union");
            expect((result as any).element.members).toHaveLength(2);
            expect((result as any).element.members[0].kind).toBe("string");
            expect((result as any).element.members[1].kind).toBe("float64");
        });

        it("should convert nested array schema", () => {
            const schema = valibot.array(valibot.array(valibot.number()));
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("array");
            expect((result as any).element.kind).toBe("array");
            expect((result as any).element.element.kind).toBe("float64");
        });

        it("should convert array of literals", () => {
            const schema = valibot.array(valibot.literal("status"));
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("array");
            expect((result as any).element.kind).toBe("literal");
        });
    });

    describe("object types", () => {
        it("should convert object schema", () => {
            const schema = valibot.object({
                name: valibot.string(),
                age: valibot.number(),
            });
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("object");
            expect((result as any).fields).toBeDefined();
            expect((result as any).fields.name.kind).toBe("string");
            expect((result as any).fields.age.kind).toBe("float64");
        });

        it("should convert strict object schema", () => {
            const schema = valibot.strictObject({
                name: valibot.string(),
                age: valibot.number(),
            });
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("object");
            expect((result as any).fields).toBeDefined();
            expect((result as any).fields.name.kind).toBe("string");
            expect((result as any).fields.age.kind).toBe("float64");
        });

        it("should convert object with mixed types", () => {
            const schema = valibot.object({
                id: valibot.bigint(),
                name: valibot.string(),
                active: valibot.boolean(),
                score: valibot.number(),
                tags: valibot.array(valibot.string()),
            });
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("object");
            expect((result as any).isOptional).toBe("required");
            expect((result as any).fields).toBeDefined();
            expect((result as any).fields.id.kind).toBe("int64");
            expect((result as any).fields.id.isOptional).toBe("required");
            expect((result as any).fields.name.kind).toBe("string");
            expect((result as any).fields.name.isOptional).toBe("required");
            expect((result as any).fields.active.kind).toBe("boolean");
            expect((result as any).fields.active.isOptional).toBe("required");
            expect((result as any).fields.score.kind).toBe("float64");
            expect((result as any).fields.score.isOptional).toBe("required");
            expect((result as any).fields.tags.kind).toBe("array");
            expect((result as any).fields.tags.isOptional).toBe("required");
        });

        it("should convert object with mixed required and optional fields", () => {
            const schema = valibot.object({
                id: valibot.string(), // required
                name: valibot.string(), // required
                email: valibot.optional(valibot.string()), // optional
                phone: valibot.optional(valibot.string()), // optional
                address: valibot.string(), // required
            });
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("object");
            expect((result as any).isOptional).toBe("required");
            expect((result as any).fields.id.kind).toBe("string");
            expect((result as any).fields.id.isOptional).toBe("required");
            expect((result as any).fields.name.kind).toBe("string");
            expect((result as any).fields.name.isOptional).toBe("required");
            expect((result as any).fields.email.kind).toBe("string");
            expect((result as any).fields.email.isOptional).toBe("optional");
            expect((result as any).fields.phone.kind).toBe("string");
            expect((result as any).fields.phone.isOptional).toBe("optional");
            expect((result as any).fields.address.kind).toBe("string");
            expect((result as any).fields.address.isOptional).toBe("required");
        });

        it("should convert object with optional fields", () => {
            const schema = valibot.object({
                name: valibot.string(),
                email: valibot.optional(valibot.string()),
                phone: valibot.nullable(valibot.string()),
            });
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("object");
            expect((result as any).isOptional).toBe("required");
            expect((result as any).fields).toBeDefined();
            expect((result as any).fields.name.kind).toBe("string");
            expect((result as any).fields.name.isOptional).toBe("required");
            expect((result as any).fields.email.kind).toBe("string");
            expect((result as any).fields.email.isOptional).toBe("optional");
            expect((result as any).fields.phone.kind).toBe("union");
            expect((result as any).fields.phone.isOptional).toBe("required");
        });

        it("should convert object with literal fields", () => {
            const schema = valibot.object({
                type: valibot.literal("user"),
                status: valibot.literal("active"),
                version: valibot.literal(1),
            });
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("object");
            expect((result as any).fields).toBeDefined();
            expect((result as any).fields.type.kind).toBe("literal");
            expect((result as any).fields.type.value).toBe("user");
            expect((result as any).fields.status.kind).toBe("literal");
            expect((result as any).fields.status.value).toBe("active");
            expect((result as any).fields.version.kind).toBe("literal");
            expect((result as any).fields.version.value).toBe(1);
        });

        it("should convert nested object schema", () => {
            const schema = valibot.object({
                user: valibot.object({
                    name: valibot.string(),
                    email: valibot.string(),
                }),
                settings: valibot.object({
                    theme: valibot.string(),
                    notifications: valibot.boolean(),
                }),
            });
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("object");
            expect((result as any).fields).toBeDefined();
            expect((result as any).fields.user.kind).toBe("object");
            expect((result as any).fields.settings.kind).toBe("object");

            // Validate nested object fields
            expect((result as any).fields.user.fields.name.kind).toBe("string");
            expect((result as any).fields.user.fields.email.kind).toBe(
                "string"
            );
            expect((result as any).fields.settings.fields.theme.kind).toBe(
                "string"
            );
            expect(
                (result as any).fields.settings.fields.notifications.kind
            ).toBe("boolean");
        });

        it("should convert object with union fields", () => {
            const schema = valibot.object({
                value: valibot.union([valibot.string(), valibot.number()]),
                type: valibot.union([
                    valibot.literal("text"),
                    valibot.literal("number"),
                ]),
            });
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("object");
            expect((result as any).fields).toBeDefined();
            expect((result as any).fields.value.kind).toBe("union");
            expect((result as any).fields.value.members).toHaveLength(2);
            expect((result as any).fields.value.members[0].kind).toBe("string");
            expect((result as any).fields.value.members[1].kind).toBe(
                "float64"
            );
            expect((result as any).fields.type.kind).toBe("literal"); // deduplicated by uniqueUnions
        });

        it("should convert deeply nested object", () => {
            const schema = valibot.object({
                level1: valibot.object({
                    level2: valibot.object({
                        level3: valibot.object({
                            value: valibot.string(),
                        }),
                    }),
                }),
            });
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("object");
            expect((result as any).fields.level1.kind).toBe("object");
            expect((result as any).fields.level1.fields.level2.kind).toBe(
                "object"
            );
            expect(
                (result as any).fields.level1.fields.level2.fields.level3.kind
            ).toBe("object");
            expect(
                (result as any).fields.level1.fields.level2.fields.level3.fields
                    .value.kind
            ).toBe("string");
        });
    });

    describe("record types", () => {
        it("should convert record schema", () => {
            const schema = valibot.record(valibot.string(), valibot.number());
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("record");
            expect((result as any).isOptional).toBe("required");
            expect((result as any).key.kind).toBe("string");
            expect((result as any).key.isOptional).toBe("required");
            expect((result as any).value.kind).toBe("float64");
            expect((result as any).value.isOptional).toBe("required");
        });

        it("should convert record with string values", () => {
            const schema = valibot.record(valibot.string(), valibot.string());
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("record");
            expect((result as any).key.kind).toBe("string");
            expect((result as any).value.kind).toBe("string");
        });

        it("should convert record with object values", () => {
            const schema = valibot.record(
                valibot.string(),
                valibot.object({
                    name: valibot.string(),
                    count: valibot.number(),
                })
            );
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("record");
            expect((result as any).key.kind).toBe("string");
            expect((result as any).value.kind).toBe("object");
            expect((result as any).value.fields.name.kind).toBe("string");
            expect((result as any).value.fields.count.kind).toBe("float64");
        });

        it("should convert record with union values", () => {
            const schema = valibot.record(
                valibot.string(),
                valibot.union([
                    valibot.string(),
                    valibot.number(),
                    valibot.boolean(),
                ])
            );
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("record");
            expect((result as any).key.kind).toBe("string");
            expect((result as any).value.kind).toBe("union");
            expect((result as any).value.members).toHaveLength(3);
            expect((result as any).value.members[0].kind).toBe("string");
            expect((result as any).value.members[1].kind).toBe("float64");
            expect((result as any).value.members[2].kind).toBe("boolean");
        });

        it("should convert record with array values", () => {
            const schema = valibot.record(
                valibot.string(),
                valibot.array(valibot.string())
            );
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("record");
            expect((result as any).key.kind).toBe("string");
            expect((result as any).value.kind).toBe("array");
            expect((result as any).value.element.kind).toBe("string");
        });
    });

    describe("union types", () => {
        it("should convert union schema", () => {
            const schema = valibot.union([valibot.string(), valibot.number()]);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("union");
            expect((result as any).members).toHaveLength(2);
            expect((result as any).members[0].kind).toBe("string");
            expect((result as any).members[1].kind).toBe("float64");
        });

        it("should deduplicate identical union members", () => {
            const schema = valibot.union([valibot.string(), valibot.string()]);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("string");
        });

        it("should handle complex union with multiple types", () => {
            const schema = valibot.union([
                valibot.string(),
                valibot.number(),
                valibot.boolean(),
            ]);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("union");
            expect((result as any).members).toHaveLength(3);
            expect((result as any).members[0].kind).toBe("string");
            expect((result as any).members[1].kind).toBe("float64");
            expect((result as any).members[2].kind).toBe("boolean");
        });

        it("should handle union with literals", () => {
            const schema = valibot.union([
                valibot.literal("admin"),
                valibot.literal("user"),
                valibot.literal("guest"),
            ]);
            const result = valibotToConvex(schema);
            // Note: uniqueUnions deduplicates by kind, so all literals become one
            expect(result.kind).toBe("literal");
        });

        it("should handle mixed union with primitives and literals", () => {
            const schema = valibot.union([
                valibot.string(),
                valibot.literal(42),
                valibot.boolean(),
            ]);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("union");
            expect((result as any).members).toHaveLength(3);
            expect((result as any).members[0].kind).toBe("string");
            expect((result as any).members[1].kind).toBe("literal");
            expect((result as any).members[1].value).toBe(42);
            expect((result as any).members[2].kind).toBe("boolean");
        });

        it("should handle union with multiple different literals", () => {
            const schema = valibot.union([
                valibot.literal("active"),
                valibot.literal("inactive"),
                valibot.literal("pending"),
            ]);
            const result = valibotToConvex(schema);
            // Note: uniqueUnions deduplicates by kind, so this becomes a single literal
            expect(result.kind).toBe("literal");
        });

        it("should handle union with mixed literal types preserving values", () => {
            const schema = valibot.union([
                valibot.string(),
                valibot.literal("admin"),
                valibot.literal(404),
                valibot.literal(true),
            ]);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("union");
            expect((result as any).members).toHaveLength(2); // string + literal (deduplicated)
            expect((result as any).members[0].kind).toBe("string");
            expect((result as any).members[1].kind).toBe("literal");
            // The literal value will be the last one processed (true)
            expect((result as any).members[1].value).toBe(true);
        });

        it("should handle union with different primitive types and literals", () => {
            const schema = valibot.union([
                valibot.string(),
                valibot.number(),
                valibot.literal("status"),
            ]);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("union");
            expect((result as any).members).toHaveLength(3);
            expect((result as any).members[0].kind).toBe("string");
            expect((result as any).members[1].kind).toBe("float64");
            expect((result as any).members[2].kind).toBe("literal");
            expect((result as any).members[2].value).toBe("status");
        });

        it("should demonstrate uniqueUnions deduplication behavior", () => {
            const schema = valibot.union([
                valibot.string(),
                valibot.string(), // duplicate
                valibot.number(),
                valibot.number(), // duplicate
                valibot.boolean(),
            ]);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("union");
            expect((result as any).members).toHaveLength(3); // deduplicated
            expect((result as any).members[0].kind).toBe("string");
            expect((result as any).members[1].kind).toBe("float64");
            expect((result as any).members[2].kind).toBe("boolean");
        });
    });

    describe("optional types", () => {
        it("should convert optional schema", () => {
            const schema = valibot.optional(valibot.string());
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("string");
            expect((result as any).isOptional).toBe("optional");
        });

        it("should convert required string schema", () => {
            const schema = valibot.string();
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("string");
            expect((result as any).isOptional).toBe("required");
        });

        it("should convert undefinedable schema", () => {
            const schema = valibot.undefinedable(valibot.string());
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("string");
            expect((result as any).isOptional).toBe("optional");
        });

        it("should handle non_optional schema", () => {
            const schema = valibot.nonOptional(
                valibot.optional(valibot.string())
            );
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("string");
            expect((result as any).isOptional).toBe("required");
        });

        it("should handle optional in non_optional context", () => {
            const schema = valibot.optional(valibot.string());
            const result = valibotToConvex(schema, { inNonOptional: true });
            expect(result.kind).toBe("string");
            expect((result as any).isOptional).toBe("required");
        });

        it("should convert optional number", () => {
            const schema = valibot.optional(valibot.number());
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("float64");
            expect((result as any).isOptional).toBe("optional");
        });

        it("should convert optional boolean", () => {
            const schema = valibot.optional(valibot.boolean());
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("boolean");
            expect((result as any).isOptional).toBe("optional");
        });

        it("should convert optional literal", () => {
            const schema = valibot.optional(valibot.literal("status"));
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("literal");
            expect((result as any).value).toBe("status");
            expect((result as any).isOptional).toBe("optional");
        });

        it("should convert optional with complex wrapped type", () => {
            const schema = valibot.optional(
                valibot.object({
                    name: valibot.string(),
                    age: valibot.number(),
                })
            );
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("object");
            expect((result as any).isOptional).toBe("optional");
            expect((result as any).fields.name.kind).toBe("string");
            expect((result as any).fields.name.isOptional).toBe("required");
            expect((result as any).fields.age.kind).toBe("float64");
            expect((result as any).fields.age.isOptional).toBe("required");
        });

        it("should convert optional array", () => {
            const schema = valibot.optional(valibot.array(valibot.string()));
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("array");
            expect((result as any).isOptional).toBe("optional");
            expect((result as any).element.kind).toBe("string");
            expect((result as any).element.isOptional).toBe("required");
        });

        it("should convert optional union", () => {
            const schema = valibot.optional(
                valibot.union([valibot.string(), valibot.number()])
            );
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("union");
            expect((result as any).isOptional).toBe("optional");
            expect((result as any).members).toHaveLength(2);
            expect((result as any).members[0].isOptional).toBe("required");
            expect((result as any).members[1].isOptional).toBe("required");
        });
    });

    describe("nullable types", () => {
        it("should convert nullable schema", () => {
            const schema = valibot.nullable(valibot.string());
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("union");
            expect((result as any).members).toHaveLength(2);
            expect((result as any).members[0].kind).toBe("null");
            expect((result as any).members[1].kind).toBe("string");
        });

        it("should convert nullable number schema", () => {
            const schema = valibot.nullable(valibot.number());
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("union");
            expect((result as any).members).toHaveLength(2);
            expect((result as any).members[0].kind).toBe("null");
            expect((result as any).members[1].kind).toBe("float64");
        });

        it("should handle non_nullable schema", () => {
            const schema = valibot.nonNullable(
                valibot.nullable(valibot.string())
            );
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("string");
        });

        it("should handle nullable in non_nullable context", () => {
            const schema = valibot.nullable(valibot.string());
            const result = valibotToConvex(schema, { inNonNullable: true });
            expect(result.kind).toBe("string");
        });
    });

    describe("nullish types", () => {
        it("should convert nullish schema", () => {
            const schema = valibot.nullish(valibot.string());
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("union");
        });

        it("should handle non_nullish schema", () => {
            const schema = valibot.nonNullish(
                valibot.nullish(valibot.string())
            );
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("string");
        });

        it("should handle nullish in non_nullish context", () => {
            const schema = valibot.nullish(valibot.string());
            const result = valibotToConvex(schema, { inNonNullish: true });
            expect(result.kind).toBe("string");
        });
    });

    describe("enum and picklist types", () => {
        it("should convert enum schema", () => {
            enum TestEnum {
                A = "a",
                B = "b",
                C = "c",
            }
            const schema = valibot.enum_(TestEnum);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("union");
            expect((result as any).members).toHaveLength(3);
            expect(
                (result as any).members.every((m: any) => m.kind === "literal")
            ).toBe(true);

            // Verify literal values are preserved
            const values = (result as any).members.map((m: any) => m.value);
            expect(values).toContain("a");
            expect(values).toContain("b");
            expect(values).toContain("c");
        });

        it("should convert picklist schema", () => {
            const schema = valibot.picklist(["red", "green", "blue"]);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("union");
            expect((result as any).members).toHaveLength(3);
            expect(
                (result as any).members.every((m: any) => m.kind === "literal")
            ).toBe(true);

            // Verify literal values are preserved
            const values = (result as any).members.map((m: any) => m.value);
            expect(values).toContain("red");
            expect(values).toContain("green");
            expect(values).toContain("blue");
        });

        it("should convert numeric enum schema", () => {
            enum NumericEnum {
                First = 1,
                Second = 2,
                Third = 3,
            }
            const schema = valibot.enum_(NumericEnum);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("union");
            expect((result as any).members).toHaveLength(3);
            expect(
                (result as any).members.every((m: any) => m.kind === "literal")
            ).toBe(true);

            // Verify literal values are preserved
            const values = (result as any).members.map((m: any) => m.value);
            expect(values).toContain(1);
            expect(values).toContain(2);
            expect(values).toContain(3);
        });

        it("should convert mixed picklist schema", () => {
            const schema = valibot.picklist([1, "two", 3]);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("union");
            expect((result as any).members).toHaveLength(3);
            expect(
                (result as any).members.every((m: any) => m.kind === "literal")
            ).toBe(true);

            // Verify literal values are preserved
            const values = (result as any).members.map((m: any) => m.value);
            expect(values).toContain(1);
            expect(values).toContain("two");
            expect(values).toContain(3);
        });

        it("should convert status enum with specific values", () => {
            const schema = valibot.picklist(["draft", "published", "archived"]);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("union");
            expect((result as any).members).toHaveLength(3);

            // Verify exact literal values
            const member1 = (result as any).members.find(
                (m: any) => m.value === "draft"
            );
            const member2 = (result as any).members.find(
                (m: any) => m.value === "published"
            );
            const member3 = (result as any).members.find(
                (m: any) => m.value === "archived"
            );

            expect(member1).toBeDefined();
            expect(member1.kind).toBe("literal");
            expect(member2).toBeDefined();
            expect(member2.kind).toBe("literal");
            expect(member3).toBeDefined();
            expect(member3.kind).toBe("literal");
        });
    });

    describe("variant types", () => {
        it("should convert variant schema", () => {
            const schema = valibot.variant("type", [
                valibot.object({
                    type: valibot.literal("a"),
                    value: valibot.string(),
                }),
                valibot.object({
                    type: valibot.literal("b"),
                    value: valibot.number(),
                }),
            ]);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("union");
            expect((result as any).members).toHaveLength(2);
            expect(
                (result as any).members.every((m: any) => m.kind === "object")
            ).toBe(true);
        });

        it("should convert variant schema with three options", () => {
            const schema = valibot.variant("kind", [
                valibot.object({
                    kind: valibot.literal("circle"),
                    radius: valibot.number(),
                }),
                valibot.object({
                    kind: valibot.literal("square"),
                    side: valibot.number(),
                }),
                valibot.object({
                    kind: valibot.literal("rectangle"),
                    width: valibot.number(),
                    height: valibot.number(),
                }),
            ]);
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("union");
            expect((result as any).members).toHaveLength(3);
            expect(
                (result as any).members.every((m: any) => m.kind === "object")
            ).toBe(true);
        });
    });

    describe("undefined type", () => {
        it("should convert undefined schema", () => {
            const schema = valibot.undefined_();
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("any");
        });
    });

    describe("unsupported types", () => {
        it("should throw error for blob", () => {
            const schema = { type: "blob" } as any;
            expect(() => valibotToConvex(schema)).toThrow(ConvexError);
            expect(() => valibotToConvex(schema)).toThrow(
                "Blob is not supported"
            );
        });

        it("should throw error for file", () => {
            const schema = { type: "file" } as any;
            expect(() => valibotToConvex(schema)).toThrow(ConvexError);
            expect(() => valibotToConvex(schema)).toThrow(
                "File is not supported"
            );
        });

        it("should throw error for date", () => {
            const schema = valibot.date();
            expect(() => valibotToConvex(schema)).toThrow(ConvexError);
            expect(() => valibotToConvex(schema)).toThrow(
                "Date can be saved in Convex"
            );
        });

        it("should throw error for function", () => {
            const schema = { type: "function" } as any;
            expect(() => valibotToConvex(schema)).toThrow(ConvexError);
            expect(() => valibotToConvex(schema)).toThrow(
                "Function is not supported"
            );
        });

        it("should throw error for intersect", () => {
            const schema = { type: "intersect" } as any;
            expect(() => valibotToConvex(schema)).toThrow(ConvexError);
            expect(() => valibotToConvex(schema)).toThrow(
                "Not supported : use object merging"
            );
        });

        it("should throw error for lazy", () => {
            const schema = { type: "lazy" } as any;
            expect(() => valibotToConvex(schema)).toThrow(ConvexError);
            expect(() => valibotToConvex(schema)).toThrow(
                "Lazy schemas are not supported"
            );
        });

        it("should throw error for never", () => {
            const schema = { type: "never" } as any;
            expect(() => valibotToConvex(schema)).toThrow(ConvexError);
            expect(() => valibotToConvex(schema)).toThrow(
                "Never is not supported"
            );
        });

        it("should throw error for promise", () => {
            const schema = { type: "promise" } as any;
            expect(() => valibotToConvex(schema)).toThrow(ConvexError);
            expect(() => valibotToConvex(schema)).toThrow(
                "Promise is not supported"
            );
        });

        it("should throw error for void", () => {
            const schema = { type: "void" } as any;
            expect(() => valibotToConvex(schema)).toThrow(ConvexError);
            expect(() => valibotToConvex(schema)).toThrow(
                "Void schema is not supported"
            );
        });
    });

    describe("fallback to any", () => {
        it("should return v.any() for unknown schema type", () => {
            const schema = { type: "unknown_type" } as any;
            const result = valibotToConvex(schema);
            expect(result.kind).toBe("any");
        });
    });

    describe("cached convex validators", () => {
        it("should handle schemas with kind property", () => {
            const schema = {
                ...valibot.string(),
                kind: "test",
            };

            const result = valibotToConvex(schema as any);
            expect(result.kind).toBe("string");
        });
    });

    describe("complex nested schemas", () => {
        it("should handle deeply nested object with arrays and unions", () => {
            const schema = valibot.object({
                users: valibot.array(
                    valibot.object({
                        id: valibot.number(),
                        name: valibot.string(),
                        email: valibot.optional(valibot.string()),
                        role: valibot.union([
                            valibot.literal("admin"),
                            valibot.literal("user"),
                            valibot.literal("guest"),
                        ]),
                        metadata: valibot.nullable(
                            valibot.record(
                                valibot.string(),
                                valibot.union([
                                    valibot.string(),
                                    valibot.number(),
                                    valibot.boolean(),
                                ])
                            )
                        ),
                    })
                ),
                settings: valibot.object({
                    theme: valibot.optional(valibot.string()),
                    notifications: valibot.boolean(),
                }),
            });

            const result = valibotToConvex(schema);

            // Root object validation
            expect(result.kind).toBe("object");
            expect((result as any).fields).toBeDefined();

            // Users array validation
            expect((result as any).fields.users.kind).toBe("array");
            const userElement = (result as any).fields.users.element;
            expect(userElement.kind).toBe("object");

            // User object fields validation
            expect(userElement.fields.id.kind).toBe("float64");
            expect(userElement.fields.name.kind).toBe("string");
            expect(userElement.fields.email.kind).toBe("string"); // optional unwrapped
            expect(userElement.fields.role.kind).toBe("literal"); // union deduplicated

            // Metadata validation (nullable record)
            expect(userElement.fields.metadata.kind).toBe("union");
            expect(userElement.fields.metadata.members).toHaveLength(2);
            expect(userElement.fields.metadata.members[0].kind).toBe("null");
            expect(userElement.fields.metadata.members[1].kind).toBe("record");

            // Record value validation (inside nullable)
            const recordMember = userElement.fields.metadata.members[1];
            expect(recordMember.key.kind).toBe("string");
            expect(recordMember.value.kind).toBe("union");
            expect(recordMember.value.members).toHaveLength(3);
            expect(recordMember.value.members[0].kind).toBe("string");
            expect(recordMember.value.members[1].kind).toBe("float64");
            expect(recordMember.value.members[2].kind).toBe("boolean");

            // Settings object validation
            expect((result as any).fields.settings.kind).toBe("object");
            expect((result as any).fields.settings.fields.theme.kind).toBe(
                "string"
            ); // optional unwrapped
            expect(
                (result as any).fields.settings.fields.notifications.kind
            ).toBe("boolean");
        });

        it("should validate complete e-commerce schema structure", () => {
            const schema = valibot.object({
                products: valibot.array(
                    valibot.object({
                        id: valibot.string(),
                        name: valibot.string(),
                        price: valibot.number(),
                        categories: valibot.array(valibot.string()),
                        inventory: valibot.object({
                            inStock: valibot.boolean(),
                            quantity: valibot.number(),
                            warehouse: valibot.literal("main"),
                        }),
                    })
                ),
                orders: valibot.record(
                    valibot.string(),
                    valibot.object({
                        status: valibot.union([
                            valibot.literal("pending"),
                            valibot.literal("shipped"),
                            valibot.literal("delivered"),
                        ]),
                        items: valibot.array(
                            valibot.object({
                                productId: valibot.string(),
                                quantity: valibot.number(),
                            })
                        ),
                    })
                ),
            });

            const result = valibotToConvex(schema);

            // Root validation
            expect(result.kind).toBe("object");

            // Products array validation
            expect((result as any).fields.products.kind).toBe("array");
            const productElement = (result as any).fields.products.element;
            expect(productElement.kind).toBe("object");
            expect(productElement.fields.id.kind).toBe("string");
            expect(productElement.fields.categories.kind).toBe("array");
            expect(productElement.fields.categories.element.kind).toBe(
                "string"
            );
            expect(productElement.fields.inventory.kind).toBe("object");
            expect(productElement.fields.inventory.fields.warehouse.kind).toBe(
                "literal"
            );

            // Orders record validation
            expect((result as any).fields.orders.kind).toBe("record");
            expect((result as any).fields.orders.key.kind).toBe("string");
            const orderValue = (result as any).fields.orders.value;
            expect(orderValue.kind).toBe("object");
            expect(orderValue.fields.status.kind).toBe("literal"); // union deduplicated
            expect(orderValue.fields.items.kind).toBe("array");
            expect(orderValue.fields.items.element.kind).toBe("object");
        });

        it("should validate blog schema with convexIds", () => {
            const schema = valibot.object({
                posts: valibot.array(
                    valibot.object({
                        _id: convexId("posts"),
                        title: valibot.string(),
                        content: valibot.string(),
                        authorId: convexId("users"),
                        categoryId: valibot.optional(convexId("categories")),
                        tags: valibot.array(convexId("tags")),
                        metadata: valibot.object({
                            views: valibot.number(),
                            likes: valibot.array(convexId("users")),
                            relatedPosts: valibot.optional(
                                valibot.array(convexId("posts"))
                            ),
                        }),
                    })
                ),
                users: valibot.record(
                    valibot.string(),
                    valibot.object({
                        _id: convexId("users"),
                        name: valibot.string(),
                        email: valibot.string(),
                        followedBy: valibot.union([
                            valibot.array(convexId("users")),
                            valibot.null(),
                        ]),
                    })
                ),
            });

            const result = valibotToConvex(schema);

            // Root validation
            expect(result.kind).toBe("object");

            // Posts array validation
            const postsArray = (result as any).fields.posts;
            expect(postsArray.kind).toBe("array");
            const postElement = postsArray.element;
            expect(postElement.kind).toBe("object");

            // Post fields validation
            expect(postElement.fields._id.kind).toBe("id");
            expect(postElement.fields._id.tableName).toBe("posts");
            expect(postElement.fields._id.isOptional).toBe("required");

            expect(postElement.fields.authorId.kind).toBe("id");
            expect(postElement.fields.authorId.tableName).toBe("users");
            expect(postElement.fields.authorId.isOptional).toBe("required");

            expect(postElement.fields.categoryId.kind).toBe("id");
            expect(postElement.fields.categoryId.tableName).toBe("categories");
            expect(postElement.fields.categoryId.isOptional).toBe("optional");

            expect(postElement.fields.tags.kind).toBe("array");
            expect(postElement.fields.tags.element.kind).toBe("id");
            expect(postElement.fields.tags.element.tableName).toBe("tags");

            // Metadata validation
            const metadata = postElement.fields.metadata;
            expect(metadata.kind).toBe("object");
            expect(metadata.fields.likes.kind).toBe("array");
            expect(metadata.fields.likes.element.kind).toBe("id");
            expect(metadata.fields.likes.element.tableName).toBe("users");

            expect(metadata.fields.relatedPosts.kind).toBe("array");
            expect(metadata.fields.relatedPosts.isOptional).toBe("optional");
            expect(metadata.fields.relatedPosts.element.kind).toBe("id");
            expect(metadata.fields.relatedPosts.element.tableName).toBe(
                "posts"
            );

            // Users record validation
            const usersRecord = (result as any).fields.users;
            expect(usersRecord.kind).toBe("record");
            const userValue = usersRecord.value;
            expect(userValue.kind).toBe("object");

            expect(userValue.fields._id.kind).toBe("id");
            expect(userValue.fields._id.tableName).toBe("users");

            expect(userValue.fields.followedBy.kind).toBe("union");
            expect(userValue.fields.followedBy.members).toHaveLength(2);
            expect(userValue.fields.followedBy.members[0].kind).toBe("array");
            expect(userValue.fields.followedBy.members[0].element.kind).toBe(
                "id"
            );
            expect(
                userValue.fields.followedBy.members[0].element.tableName
            ).toBe("users");
            expect(userValue.fields.followedBy.members[1].kind).toBe("null");
        });
    });
});
