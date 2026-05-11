import { dynamonster, table, binary, boolean, map, number, string } from "@/index";
import type { PickOnly, Schema } from "@/types";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// db.ts
export const db = dynamonster({ local: { endpoint: "http://localhost:8000" } })
// export const db = dynamonster({ dynamoDBClient: new DynamoDBClient({...}) })

// tables.ts
const posts = table("posts", {
    hashKey: string().hashKey(),
    sortKey: number().rangeKey(),

    string: string(),
    number: number(),
    boolean: boolean(),
    binary: binary(),

    stringSet: string().set(),
    numberSet: number().set(),
    binarySet: binary().set(),

    stringArray: string().array(),
    numberArray: number().array(),
    booleanArray: boolean().array(),
    binaryArray: binary().array(),

    map: map<{ a: string; b: number }>(),

    // optional
    stringOptional: string().optional(),
    numberOptional: number().optional(),
    booleanOptional: boolean().optional(),
    binaryOptional: binary().optional(),
    stringSetOptional: string().set().optional(),
    numberSetOptional: number().set().optional(),
    binarySetOptional: binary().set().optional(),
    stringArrayOptional: string().array().optional(),
    numberArrayOptional: number().array().optional(),
    booleanArrayOptional: boolean().array().optional(),
    binaryArrayOptional: binary().array().optional(),
    mapOptional: map<{ a: string; b: number }>().optional(),

    // default
    stringDefault: string().default(""),
    numberDefault: number().default(0),
    booleanDefault: boolean().default(false),
    binaryDefault: binary().default(new Uint8Array()),
    stringSetDefault: string().set().default(new Set<string>()),
    numberSetDefault: number().set().default(new Set<number>()),
    binarySetDefault: binary().set().default(new Set<Uint8Array>()),
    stringArrayDefault: string().array().default([""]),
    numberArrayDefault: number().array().default([0]),
    booleanArrayDefault: boolean().array().default([false]),
    binaryArrayDefault: binary().array().default([new Uint8Array()]),
    mapDefault: map<{ a: string; b: number }>().default({ a: "", b: 0 }),
});

// use
await db
    .table(posts)
    .get({ hashKey: "2", sortKey: 8 });

await db
    .table(posts)
    .delete({ hashKey: "4", sortKey: 9 });

await db
    .table(posts)
    .put({
        hashKey: "",
        sortKey: 0,

        string: "",
        number: 0,
        boolean: false,
        binary: new Uint8Array(),

        stringSet: new Set<string>(),
        numberSet: new Set<number>(),
        binarySet: new Set<Uint8Array>(),

        stringArray: [""],
        numberArray: [0],
        booleanArray: [false],
        binaryArray: [new Uint8Array()],

        map: { a: "", b: 0 },
    });

await db
    .table(posts)
    .delete({ hashKey: '4', sortKey: 9 });

await db
    .table(posts)
    .update(
        { hashKey: 'x', sortKey: 9 },
        {
            set: {
                number: 9,
                string: '5',
            },
            clear: ['stringOptional'],
            push: {
                stringArray: ['', '4'],
                numberArray: [1, 2, 3]
            },
            increment: {
                number: 8,
            },
            add: {
                stringSet: new Set(['']),
            },
            delete: {
                stringSet: new Set([''])
            }
        }
    );

// await db.table(posts).scan()
// await db(posts).query()

type Post = Schema<typeof posts>;
const p: Post = {
    hashKey: "",
    sortKey: 0,

    string: "",
    number: 0,
    boolean: false,
    binary: new Uint8Array(),

    stringSet: new Set<string>(),
    numberSet: new Set<number>(),
    binarySet: new Set<Uint8Array>(),

    stringArray: [""],
    numberArray: [0],
    booleanArray: [false],
    binaryArray: [new Uint8Array()],

    map: { a: "", b: 0 },
}