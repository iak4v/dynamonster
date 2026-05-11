import { table, string, number, boolean, binary, map, dynamonster } from "@/index";

export const db = dynamonster({ local: { endpoint: 'http://localhost:8000' } })

export const testEntity = {
    col_hashKey: string().hashKey(),
    col_rangeKey: number().rangeKey(),

    col_string: string("my_string"),
    col_number: number(),
    col_boolean: boolean("my_boolean_x"),
    col_binary: binary(),

    col_stringSet: string().set(),
    col_numberSet: number().set(),
    col_binarySet: binary().set(),

    col_stringArray: string("my_string_array").array(),
    col_numberArray: number().array(),
    col_booleanArray: boolean().array(),
    col_binaryArray: binary().array(),

    col_map: map<{ a: string; b: number }>(),

    // optional
    col_stringOptional: string().optional(),
    col_numberOptional: number().optional(),
    col_booleanOptional: boolean().optional(),
    col_binaryOptional: binary().optional(),
    col_stringSetOptional: string().set().optional(),
    col_numberSetOptional: number().set().optional(),
    col_binarySetOptional: binary().set().optional(),
    col_stringArrayOptional: string().array().optional(),
    col_numberArrayOptional: number().array().optional(),
    col_booleanArrayOptional: boolean().array().optional(),
    col_binaryArrayOptional: binary().array().optional(),
    col_mapOptional: map<{ a: string; b: number }>().optional(),

    // default
    col_stringDefault: string().default(""),
    col_numberDefault: number().default(0),
    col_booleanDefault: boolean().default(false),
    col_binaryDefault: binary().default(new Uint8Array()),
    col_stringSetDefault: string().set().default(new Set<string>()),
    col_numberSetDefault: number().set().default(new Set<number>()),
    col_binarySetDefault: binary().set().default(new Set<Uint8Array>()),
    col_stringArrayDefault: string().array().default([""]),
    col_numberArrayDefault: number().array().default([0]),
    col_booleanArrayDefault: boolean().array().default([false]),
    col_binaryArrayDefault: binary().array().default([new Uint8Array()]),
    col_mapDefault: map<{ a: string; b: number }>().default({ a: "", b: 0 }),
}

export const testTable = table("test-table", testEntity);