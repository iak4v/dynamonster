import type { PickOnly, DefinedOnly } from "@/types";
import { test, expectTypeOf, describe } from "bun:test";

describe("DefinedOnly", () => {
    test("undefined", () => {
        type T = { a: undefined, b: string };
        expectTypeOf<DefinedOnly<T>>().toMatchObjectType<{ b: string }>()
        expectTypeOf<DefinedOnly<T>>().not.toMatchObjectType<{}>
    })

    test("optional", () => {
        expectTypeOf<DefinedOnly<{ a?: string, b: string }>>().toMatchObjectType<{ b: string }>()
    })
})

describe("PickOnly", () => {
    type I = {
        string: string,
        number: number,
        boolean: boolean,
        string_number: string | number,
        string_boolean: string | boolean,
    }

    test("string", () => {
        expectTypeOf<PickOnly<I, string>>().toMatchObjectType<{
            string: string,
            string_number: string | number,
            string_boolean: string | boolean,
        }>()
    })

    test("number", () => {
        expectTypeOf<PickOnly<I, number>>().toMatchObjectType<{
            number: number,
            string_number: string | number
        }>()
    })

    test("boolean", () => {
        expectTypeOf<PickOnly<I, boolean>>().toMatchObjectType<{
            boolean: boolean,
            string_boolean: string | boolean
        }>()
    })

    test("string | number", () => {
        expectTypeOf<PickOnly<I, string | boolean>>().toMatchObjectType<{
            string: string;
            boolean: boolean;
            string_number: string | number;
            string_boolean: string | boolean;
        }>()

    })
})