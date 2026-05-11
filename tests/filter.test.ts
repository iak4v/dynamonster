import { and, beginsWith, contains, or } from "@/filter";
import { boolean, number, string, table } from "@/index";
import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import { db, testEntity, testTable } from "./fixtures/test-table";

test("contains", () => {
    const result = contains(testEntity.col_string, 'father');
    expect(result).toEqual({
        fe: 'contains(my_string, :contains_my_string)',
        eav: {
            ":contains_my_string": { S: 'father' }
        }
    })
})

test("beginsWith", () => {
    const result = beginsWith(testEntity.col_string, 'father');
    expect(result).toEqual({
        fe: 'begins_with(my_string, :beginsWith_my_string)',
        eav: {
            ":beginsWith_my_string": { S: 'father' }
        }
    })
})

test("and", () => {
    const result = and(
        contains(testEntity.col_string, 'father'),
        contains(testEntity.col_string, "hash")
    );

    expect(result).toEqual({
        fe: 'contains(my_string, :contains_my_string) AND contains(col_hashKey, :contains_col_hashKey)',
        eav: {
            ":contains_my_string": { S: 'father' },
            ":contains_col_hashKey": { S: 'hash' },
        }
    })
})

test("or", () => {
    const result = or(
        contains(testEntity.col_string, 'father'),
        contains(testEntity.col_hashKey, "hash")
    );

    expect(result).toEqual({
        fe: 'contains(my_string, :contains_my_string) OR contains(col_hashKey, :contains_col_hashKey)',
        eav: {
            ":contains_my_string": { S: 'father' },
            ":contains_col_hashKey": { S: 'hash' },
        }
    })
})

describe("db", () => {
    beforeAll(async () => {
        // await testTable.create();
        testTable.exists = true;
        await db
            .table(testTable)
            .put({
                col_hashKey: 'hk',
                col_rangeKey: 67,
                col_binary: new Uint8Array(),
                col_boolean: true,
                col_number: 67,
                col_string: 's',
                col_binaryArray: [new Uint8Array()],
                col_stringArray: ['sa'],
                col_binarySet: new Set([new Uint8Array()]),
                col_booleanArray: [false],
                col_map: { a: 's', b: 8 },
                col_numberArray: [1],
                col_numberSet: new Set([89]),
                col_stringSet: new Set(['ssx'])
            })
        // await db.table(testTable).scan({ where: contains(testEntity.col_string, "x") })
    })

    afterAll(async () => {
        // await testTable.delete()
        // await db.table(testTable).delete({ col_hashKey: 'hk', col_rangeKey: 67 })
    })

    test("contains", async () => {
        const j = await db.table(testTable).scan({ where: contains(testEntity.col_string, 's') });
        console.log({ j })
    })
})