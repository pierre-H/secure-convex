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
import { defineSchema } from "convex/server";
import { defineSecureTable } from "secure-convex";
import { myDb } from "./db.ts";

const schema = defineSchema({
    users: defineSecureTable(myDb.users).index("byEmail", ["email"]),
    posts: defineSecureTable(myDb.posts).index("byStatusHighlited", [
        "status",
        "highlighted",
    ]),
});

export default schema;
```

Then, create a custom secure mutation :

```ts
// convex/test.ts
import { secureMutation } from "secure-convex";
import { myDb } from "./db.ts";

const myMutation = secureMutation(myDb);
```

With myMutation, ctx.db will always performs `valibot.parseAsync` for `insert` `patch` and `replace`.
There is alse a `ctx.insecureDb` which is the original convex db object.

## Permix

You can also create a permix object from your schema :

```ts
// convex/permix.ts
import { createPermixFromDataModel } from "secure-convex";
import type { DataModel } from "../_generated/dataModel";

export const permix = createPermixFromDataModel<
    DataModel,
    {
        users: {
            action: "edit" | "delete";
            dataRequired: true;
        };
        posts: {
            action: "read";
        };
    }
>();
```

The dataType is automatically inserted from the Convex data model for Convex table name.
