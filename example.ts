import { defineSchema } from "./src/schema";
import * as valibot from "valibot";

const schema = defineSchema({
    user: {
        name: valibot.string(),
        age: valibot.number(),
        email: valibot.string(),
        isActive: valibot.boolean(),
    },
});

// Testons l'inférence de type
type SchemaType = typeof schema;

export { schema };