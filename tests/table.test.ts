import { Dynamonster, Entity, m, Table } from "@/index";
import { test, expect, describe, beforeAll, afterAll } from "bun:test";

Dynamonster.local();

describe("table", () => {
    const users = Table({
        entity: Entity({
            email: m.string().hashKey(),
            name: m.string(),
            age: m.number().default(() => Math.floor(Math.random() * 50)),
            isSub: m.boolean(),
            default: m.string().default("default-value"),
            optional: m.string().optional(),
        }),
        config: { tableName: 'users-db' }
    });

    // test("create", async () => {
    //     const user = await users
    //         .create({
    //             email: "e1",
    //             name: "a1",
    //             isSub: Math.random() > 0.5 ? false : true
    //         })
    //         .go();
    //     expect(true).toBeTrue()
    // })

    test("get", async () => {
        const user = await users.get({ email: 'e1' }).go();
        console.log({ user })
    })

    // test("update", async () => {
    //     const user = await users
    //         .update({ email: "e1" })
    //         .set({ isSub: true })
    //         .go();
    //     expect(true).toBeTrue()
    // });

    // test("delete", async () => {
    //     await users
    //         .delete({
    //             email: "e1"
    //         })
    //         .go()
    // })
})