# Dynamonster

---

Dynamonster is a modelling tool for Amazon's DynamoDB. It is built on top of the `@aws-sdk/client-dynamodb` and provides a better Developer Experience and ease in working with it.

Dynamonster is completely end to end Type-safe and inspired by the the Syntax Design of [Google Firestore](https://firebase.google.com/docs/firestore).

## Documentation

Check out the documentation of this library on dedicated page [here](https://iak4v.github.io/dynamonster/docs/getting_started/introduction)

## Installation

> `npm i dynamonster`

## Setting up DynamoDB

```ts
import {Dynamonster} from "dynamonster";

Dynamonster.set({
    credentials: {
        accessKeyId: "ABC******" // IAM Access Key ID,
        secretAccessKeyId: "abc******" // IAM Secret Access Key ID,
    }
});
// For development purposes;
// Dynamonster.local();
```

## Creation and Validation using the Collections
```ts
import {Table, Entity, m} from "dynamonster";

export const users = Table({
    entity: Entity({
        email: m.string().hashKey(),
        name: m.string(),
        age: m.number().min(18),
        isSubscribed: m.boolean().default(false),
        pictureUrl: m.string().optional(),
    }),
    config: {tableName: 'my-users-db'}
})

export type User = m.infer<typeof users>;
// User = {
//     email: string,
//     name: string,
//     age: number,
//     isSubscribed?: boolean,
//     pictureUrl?: string
// }
```

## Operations on the Table

Very developer friendly syntax to perform operation on the table

1. Create an item

```ts
const myUser = await users
    .create({
        email: "admin@example.com",
        name: "Admin",
        age: 29,
        isSubscribed: true
    })
    .go();

// If an item with conflicting email (hash key) already exists, then throws DynamosterItemAlreadyExistsError
```

2. Read an item from a collection

```ts
const myUser = await users
    .get({ email: "admin@gmail.com" })
    .attributes(["email", "name"])
    .go();

// myUser = {
//     email: string,
//     name: string
// }
```

3. Update an item

```ts
const updatedUser = await users
    .update({ email: "admin@gmail.com" })
    .set({ name: "New Title" })
    .go()
```

4. Delete an item

```ts
const deletedUser = await ddb
    .delete({ email: "admin@example.com" })
    .go();
```