import { EntityError } from "@/error";
import { entity, string, number, boolean } from "@/index";
import { test, expect, describe } from "bun:test";


describe("keys", () => {
    describe("hash key", () => {
        test("no hash key", () => {
            expect(() => entity({ name: string() })).toThrow(new EntityError('entity must have 1 hashKey, received 0'))
        })

        test("more than 1 hash key", () => {
            expect(() => entity({ id: string().hashKey(), uuid: string().hashKey() })).toThrow(new EntityError('entity must have 1 hashKey, received more than 1'))
        })

        test("hash key config", () => {
            expect(entity({ hk: string().hashKey() }).$keys).toEqual({ "HASH": { name: "hk", type: 'S' } })
            expect(entity({ hk: number().hashKey() }).$keys).toEqual({ "HASH": { name: "hk", type: 'N' } })
        })
    })

    describe("range key", () => {
        test("no range key", () => {
            expect(() => entity({ name: string().hashKey() })).not.toThrow()
        })

        test("more than 1 range key", () => {
            expect(() => entity({ id: string().rangeKey(), uuid: string().rangeKey() })).toThrow(new EntityError('entity must have either 0 or 1 rangeKey, received more than 1'))
        })

        test("range key config", () => {
            expect(entity({ hk: string().hashKey(), rk: string().rangeKey() }).$keys).toEqual({
                "HASH": { name: "hk", type: 'S' },
                "RANGE": { name: "rk", type: 'S' },
            })

            expect(entity({ hk: string().hashKey(), rk: number().rangeKey() }).$keys).toEqual({
                "HASH": { name: "hk", type: 'S' },
                "RANGE": { name: "rk", type: 'N' },
            })
        })
    })
})