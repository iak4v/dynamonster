import { test, expect, describe, afterAll, beforeAll, beforeEach, afterEach } from "bun:test";
import { db } from "./fixtures/test-table";
import { boolean, map, number, string, table } from "@/index";
import { ConfigError, OperationError } from "@/error";
import { DeleteItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { ddbx } from "@/ddbx";
import { contains } from "@/filter";

export const postTable = table("test-table", {
    hashKey: string().hashKey().prefix("POST"),
    rangeKey: number("my_rangekey").rangeKey(),
    title: string("post_title").minLength(10),
    indexable: boolean(),
    totalLikes: number("post_total_likes").default(9),
    likedUsers: string().set(),
    authors: string().array(),
    seo: map<{ keywords: string[], desc: string }>().optional(),
})

// try { await postTable.create() } catch { }

postTable.exists = true;

// beforeAll(async () => {
//     await postTable.create();
// })

// afterAll(async () => {
//     await postTable.delete()
// })

const hashKey = 'px-1';
const rangeKey = 123;

// describe("get", () => {

//     beforeAll(async () => {
//         await db.table(postTable).put({ hashKey, rangeKey, title: 'title title title', indexable: false, authors: ['admin1'], likedUsers: new Set(['u1']) })
//     })

//     // afterAll(async () => {
//     //     await db.table(postTable).delete({ hashKey, rangeKey })
//     // })

//     test("success", async () => {
//         const { result, error } = await db.table(postTable).get({ hashKey, rangeKey }, ['hashKey', 'indexable', 'title'])

//         expect(error).toBeUndefined()
//         expect(result).toEqual({
//             hashKey,
//             indexable: false,
//             title: 'title title title'
//         })
//     })

//     test("failed", async () => {
//         const { result, error } = await db.table(postTable).get({ hashKey: 'p-2', rangeKey: 1 }, ['indexable', 'title'])

//         expect(result).toBeUndefined()
//         expect(error).toBeInstanceOf(OperationError)
//         expect(error).not.toBeInstanceOf(ConfigError)
//     })
// })

// describe("exists", () => {
//     beforeAll(async () => {
//         await db.table(postTable).put({ hashKey, rangeKey, title: 'title title title', indexable: false })
//     })

//     afterAll(async () => {
//         await db.table(postTable).delete({ hashKey, rangeKey })
//     })

//     test("true", async () => {
//         const { exists } = await db.table(postTable).exists({ hashKey, rangeKey });
//         expect(exists).toBeTrue();
//     })

//     test("false", async () => {
//         const { exists } = await db.table(postTable).exists({ hashKey: String(Math.random()), rangeKey: Math.floor(Math.random() * 100) });
//         expect(exists).toBeFalse();
//     })

// })

// describe("put", () => {
//     afterAll(async () => {
//         await db.table(postTable).delete({ hashKey, rangeKey })
//     })

//     test("success", async () => {
//         const { success } = await db.table(postTable).put({ hashKey, rangeKey, title: 'title title title - put', indexable: false });
//         expect(success).toBeTrue()

//         // checking again
//         const { exists } = await db.table(postTable).exists({ hashKey, rangeKey });
//         expect(exists).toBeTrue();

//         // checking its body
//         const { result, error } = await db.table(postTable).get({ hashKey, rangeKey });
//         expect(error).toBeUndefined()
//         expect(result).toEqual({
//             hashKey,
//             rangeKey,
//             title: 'title title title - put',
//             indexable: false,
//             opt: '8ijm'
//         })
//     })
// })

// describe("delete", () => {
//     test("success", async () => {
//         // creating
//         await db.table(postTable).put({ hashKey, rangeKey, title: "this is title no 3", indexable: false })

//         // checking if truly exists
//         const { exists } = await db.table(postTable).exists({ hashKey, rangeKey });
//         expect(exists).toBeTrue();

//         const { success } = await db.table(postTable).delete({ hashKey, rangeKey })
//         expect(success).toBeTrue();

//         // checking for existence again to confirm
//         const { exists: again } = await db.table(postTable).exists({ hashKey, rangeKey });
//         expect(again).toBeFalse();
//     })
// })

// const userTable = table("user-table", {
//     email: string().hashKey(),
//     name: string("name_of_user"),
//     age: number(),
//     isMinor: boolean(),
// })

// userTable.exists = true;

// describe("update", () => {
//     beforeAll(async () => {
//         await db.table(userTable).put({ email: 'u1', name: "Test", age: 45, isMinor: false })
//     })

//     // afterAll(async () => {
//     //     await db.table(postTable).delete({ hashKey, rangeKey })
//     // })

//     test("set", async () => {
//         await db.table(userTable).update({ email: 'u1' }, {
//             set: {
//                 name: "new name" // TODO: validate col value
//             },

//         })

//         // checking
//         const { result, error } = await db.table(userTable).get({ email: 'u1' }, ['name']);
//         expect(result).toEqual({ name: "new name" })
//         expect(error).toBeUndefined()
//     })
// })

// describe("update", () => {
//     beforeEach(async () => {
//         // await db.table(postTable).put({ hashKey, rangeKey, title: 'title title title', indexable: false, likedUsers: new Set(['u1', 'u2']), authors: ['admin1', 'admin2'] });
//         await db.table(postTable).exec(new PutItemCommand({
//             TableName: postTable.name,
//             Item: {
//                 [postTable.entity.col('hashKey').name]: { S: hashKey },
//                 [postTable.entity.col("rangeKey").name]: { N: String(rangeKey) },
//                 [postTable.entity.col("title").name]: { S: 'title title title' },
//                 [postTable.entity.col("indexable").name]: { BOOL: false },
//                 [postTable.entity.col("likedUsers").name]: { SS: ['u1', 'u2'] },
//                 [postTable.entity.col("authors").name]: { L: ['admin1', 'admin2'].map(t => ({ S: t })) }
//             }
//         }));
//     })

//     afterEach(async () => {
//         await db.table(postTable).exec(new DeleteItemCommand({
//             TableName: postTable.name,
//             Key: {
//                 [postTable.entity.col("hashKey").name]: { S: hashKey },
//                 [postTable.entity.col("rangeKey").name]: { N: String(rangeKey) },
//             }
//         }));
//     })

//     test("SET", async () => {
//         const t = await db.table(postTable).update(
//             { hashKey, rangeKey },
//             { set: { title: 'title title title - new', indexable: true } }
//         );
//         const { result } = await db.table(postTable).get({ hashKey, rangeKey }, ['title', 'indexable'])
//         expect(result).toEqual({ title: "title title title - new", indexable: true });
//     })

//     test("increment", async () => {
//         const t = await db.table(postTable).update({ hashKey, rangeKey }, { increment: { totalLikes: 4 } });
//         const { result } = await db.table(postTable).get({ hashKey, rangeKey }, ['totalLikes'])
//         expect(result).toEqual({ totalLikes: 13 });
//     })

//     test("SET w/ increment", async () => {
//         const t = await db.table(postTable).update({ hashKey, rangeKey }, { set: { title: "title title title - new" }, increment: { totalLikes: -10 } });
//         const { result } = await db.table(postTable).get({ hashKey, rangeKey }, ['totalLikes', 'title'])
//         expect(result).toEqual({ title: 'title title title - new', totalLikes: -1 });
//     })

//     test("ADD", async () => {
//         await db.table(postTable).update({ hashKey, rangeKey }, { add: { likedUsers: new Set(['u3', 'u4']) } });
//         const { result } = await db.table(postTable).get({ hashKey, rangeKey }, ['likedUsers'])
//         expect(result).toEqual({ likedUsers: new Set(['u1', 'u2', 'u3', 'u4']) });
//     })

//     test("DELETE", async () => {
//         await db.table(postTable).update({ hashKey, rangeKey }, { delete: { likedUsers: new Set(['u2']) } });
//         const { result } = await db.table(postTable).get({ hashKey, rangeKey }, ['likedUsers'])
//         expect(result).toEqual({ likedUsers: new Set(['u1']) });
//     })

//     test("ADD w/ DELETE", async () => {
//         await db.table(postTable).update({ hashKey, rangeKey }, { add: { likedUsers: new Set(['u3', 'u4']) } });
//         await db.table(postTable).update({ hashKey, rangeKey }, { delete: { likedUsers: new Set(['u2', 'u3']) } });

//         const { result } = await db.table(postTable).get({ hashKey, rangeKey }, ['likedUsers'])
//         expect(result).toEqual({ likedUsers: new Set(['u1', 'u4']) });
//     })

//     test("push", async () => {
//         await db.table(postTable).update({ hashKey, rangeKey }, { push: { authors: ['admin3'] } })
//         const { result } = await db.table(postTable).get({ hashKey, rangeKey }, ['authors'])
//         expect(result).toEqual({ authors: ['admin1', 'admin2', 'admin3'] });
//     })

//     test("pop", async () => {
//         await db.table(postTable).update({ hashKey, rangeKey }, { pop: { authors: [1] } })
//         const { result } = await db.table(postTable).get({ hashKey, rangeKey }, ['authors'])
//         expect(result).toEqual({ authors: ['admin1'] });
//     })
// })

describe("scan", () => {
    beforeAll(async () => {
        // await db.table(postTable).put({ hashKey, rangeKey, title: 'title title title', indexable: false, likedUsers: new Set(['u1', 'u2']), authors: ['admin1', 'admin2'] });
        await db.table(postTable).exec(new PutItemCommand({
            TableName: postTable.name,
            Item: {
                [postTable.entity.col('hashKey').name]: { S: hashKey },
                [postTable.entity.col("rangeKey").name]: { N: String(rangeKey) },
                [postTable.entity.col("title").name]: { S: 'title title title' },
                [postTable.entity.col("indexable").name]: { BOOL: false },
                [postTable.entity.col("likedUsers").name]: { SS: ['u1', 'u2'] },
                [postTable.entity.col("authors").name]: { L: ['admin1', 'admin2'].map(t => ({ S: t })) }
            }
        }));
    })

    afterAll(async () => {
        await db.table(postTable).exec(new DeleteItemCommand({
            TableName: postTable.name,
            Key: {
                [postTable.entity.col("hashKey").name]: { S: hashKey },
                [postTable.entity.col("rangeKey").name]: { N: String(rangeKey) },
            }
        }));
    })

    test("contains (string)", async () => {
        const d = await db
            .table(postTable)
            .scan({
                where: contains(postTable.entity.col("title"), "title"),
                attributes: ['authors']
            })
    });
});