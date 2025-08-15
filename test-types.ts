import { defineSchema } from "./src/schema";
import * as valibot from "valibot";
import { type DataModelFromSchemaDefinition } from "convex/server";

const schema = defineSchema({
    user: {
        name: valibot.string(),
        age: valibot.number(),
        isActive: valibot.boolean(),
    },
});

type SchemaType = typeof schema;
type DataModel = DataModelFromSchemaDefinition<SchemaType>;
type UserTable = DataModel["user"];
type UserDoc = UserTable["document"];

// Test de compilation - si les types sont corrects, ceci devrait compiler
function testUserDoc(doc: UserDoc) {
    // Ces propriétés devraient être typées correctement
    const name: string = doc.name;
    const age: number = doc.age; 
    const isActive: boolean = doc.isActive;
    const id = doc._id;
    const creationTime: number = doc._creationTime;
    
    return { name, age, isActive, id, creationTime };
}

export { schema, testUserDoc };