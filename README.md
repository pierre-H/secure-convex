# secure-convex

**secure-convex** is a lightweight TypeScript library that supercharges your [Convex](https://convex.dev) backend with **strongly-typed runtime validation** powered by [Valibot](https://valibot.dev) and **granular permission control** via [Permix](https://github.com/davethan/permix).

It’s designed to make your Convex functions **safer, cleaner, and easier to maintain** by ensuring:

- **End-to-end strong typing** – from input validation to database writes.
- Every function input is validated against a strict Valibot schema before execution.
- Your **database schema is derived directly from Valibot schemas**, keeping data types in sync automatically.
- Every **write operation** is validated against the corresponding Valibot schema before hitting the database.
- Access rules are centralized and enforced consistently.
- Developer experience stays smooth with minimal boilerplate.

## Key features

- ✅ **Automatic input validation** for Convex queries & mutations.
- 🗄 **DB schema generation** from Valibot schemas.
- 🔒 **Permission middleware** with flexible, composable rules.
- 🛡 **Schema-validated writes** for consistent, safe data.
- 🧑‍💻 **Full TypeScript support** with strong, inferred types everywhere.
- ⚡ **Zero extra config** – just wrap your functions.
- 🧩 Works perfectly with existing Convex codebases.

## Get started

Create you schema with valibot :

```ts
// convex/db.ts
import * as v from "valibot";
import { convexId } from "secure-convex";

export enum PostStatus {
    DRAFT,
    PUBLISHED,
}

export const myDb = {
    users: {
        name: v.pipe(v.string(), v.trim(), v.minLength(3), v.maxLength(100)),
        email: v.pipe(v.string(), v.email(), v.maxLength(150)),
    },
    posts: {
        userId: convexId("users"),
        title: v.pipe(v.string(), v.maxLength(100)),
        status: v.enum(PostStatus),
        highlighted: v.boolean(),
        publishedAt: v.optional(v.number()), // timestamp
    },
};
```

Use it in your Convex schema:

```ts
// convex/schema.ts
import { defineSecureSchema } from "secure-convex";
import { myDb } from "./db.ts";

export default defineSecureSchema(myDb);
```
