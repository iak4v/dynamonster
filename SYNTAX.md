# Installation

`npm i dynamonster`

# Setup

```ts
import {Dynamonster} from "dynamonster"

Dynamonster.set(...)
// Dynamonster.local(...)
```

# Creating Table

```ts
import { Table, Entity, m } from "dynamonster";

export const ddbTable = new Table(
    new Entity({
        hashKey: m.string().hashKey(),
        rangeKey: m.string().rangeKey(),
        string: m.string(),
        number: m.number(),
        gsi1hk: m.string().gsi("GSI_1").hashKey(),
        gsi1rk: m.number().gsi("GSI_1").rangeKey(),
        lsi1: m.boolean().lsi("LSI_1").rangeKey(),
    }),
    { tableName: "test-db" },
);
```

# Performing CRUD Operations

```ts
import { ddbTable } from "@/db";

// Creating
const createdItem = await ddbTable
    .create({
        hashKey: "h-1",
        rangeKey: "r-1",
        string: "string",
        number: 0,
        gsi1hk: "gsi-1-hk",
        gsi1rk: "gsi-1-rk",
        lsi1: false,
    })
    .go();

// Reading
const item = await ddbTable.get({ hashKey: "h-1", rangeKey: "r-1" }).go();

// Updating
const updatedItem = await ddbTable
    .update({ hashKey: "h-1", rangeKey: "r-1" })
    .set({ string: "new-value" })
    .increment({ number: 2 }) // increment number by 2
    .go();

// Deleting
const deletedItem = await ddbTable.delete({ hashKey: "h-1", rangeKey: "r-1" }).go();
```

# Quering

```ts
await ddbTable.query({ hashKey: "h-1" }).go();

await ddbTable.query({ gsi1hk: "gsi-1-hk" }).go();

await ddbTable.query({ gsi1hk: "gsi-1-hk" }).where({ gsi1rk: "gsi-1-rk" }, "beginsWith").go();
```
