import type { col } from "./col";
import type { Table } from "./table";

export type DDBValue = 'S' | 'N' | 'B' | 'SS' | 'NS' | 'BS' | 'M' | 'L' | 'NULL' | 'BOOL' | '$unknown'

export type TableData<T extends Table<any>> = {
    Keys: EntityKeys<T>,
    Entity: Schema<T>,
}

export type PickColIsOptionalOnly<T> = T extends Table<infer R> ? {
    [K in keyof R as R[K] extends col<infer type, infer cc>
    ? cc extends { IsOptional: true }
    ? K : never
    : never]: never
} : never;

export type Type<C extends col> =
    C extends col<infer T, infer CC>
    ? CC["IsSet"] extends true
    ? Set<T>
    : CC["IsArray"] extends true
    ? T[]
    : T
    : never;

export type Either<T, K1 extends keyof T, K2 extends keyof T> =
    | (Required<Pick<T, K1>> & Partial<Pick<T, K2>>)
    | (Required<Pick<T, K2>> & Partial<Pick<T, K1>>);

// type Type<C extends col> = C extends col<infer Type> ? Type extends map<infer R> ? R : Type : never;
export type inferTable<T extends Table<any>> =
    T extends Table<infer R>
    ? {
        [K in keyof R]: Type<R[K]>;
    }
    : never;

export type Schema<T extends Table<any>> = T extends Table<infer R> ? Optionalize<{
    [K in keyof R]: R[K] extends col<any, infer C>
    ? C["IsOptional"] extends true
    ? Type<R[K]> | undefined
    : C["HasDefault"] extends true
    ? Type<R[K]> | undefined
    : Type<R[K]>
    : never;
}> : never;

export type Creatable<T extends Table<any>> =
    T extends Table<infer R>
    ? Optionalize<{
        [K in keyof R]: R[K] extends col<any, infer C>
        ? C["IsOptional"] extends true
        ? Type<R[K]> | undefined
        : C["HasDefault"] extends true
        ? Type<R[K]> | undefined
        : Type<R[K]>
        : never;
    }>
    : never;

export type OverrideValue<R, V> = {
    [K in keyof R]: V
}

/**
 * @example 
 * type T = Optionalize<{ a: string | undefined }> // { a?: string }
 * type T = Optionalize<{ a?: string | undefined }> // { a?: string }
 */
export type Optionalize<T extends Record<string, any>> = {
    [K in keyof T as undefined extends T[K] ? never : K]: T[K];
} & {
    [K in keyof T as undefined extends T[K] ? K : never]?: T[K];
}

/**
 * Extract primary keys out of Table
 */
export type EntityKeys<T extends Table<any>> =
    T extends Table<infer R>
    ? OmitUndefinedCompletely<{
        [K in keyof R]: R[K] extends col<infer Type, infer CC>
        ? CC extends { IsHashKey: true } | { IsRangeKey: true }
        ? Type
        : undefined
        : never;
    }>
    : never;

export type OmitUndefinedCompletely<T> = {
    [K in keyof T as T[K] extends undefined ? never : K]: T[K];
};

type OmitUndefinedPartially<T> = {
    // Keep the non-undefined keys as they are
    [K in keyof T as T[K] extends undefined ? never : K]: T[K];
} & {
    // Turn undefined keys into optional 'unknown' keys
    [K in keyof T as T[K] extends undefined ? K : never]?: unknown;
};

/**
 * Only picks keys with spefic value type
 * @example 
 * type PickOnly<{ a: string, b: number }, string> = { a: string }
 * type PickOnly<{ a: string, b: number, c: boolean }, string | boolean> = { a: string, c: boolean }
 */
export type PickOnly<T, P> = T extends Record<string, any> ? {
    [K in keyof T as P extends T[K] ? K : never]: T[K]
} : never;

/**
 * Keeps all the keys whose value can be defined, removes all undefined key-value pairs
 * @example 
 * type DefinedOnly<{ a: string }> = { a: string }
 * type DefinedOnly<{ a?: string }> = { }
 * type DefinedOnly<{ a: string|undefined }> = { }
 */
export type DefinedOnly<T> = {
    [K in keyof T as undefined extends T[K] ? never : K]: T[K]
}

/**
 * Keeps all the keys whose value is undefined, removes all defined key-value pairs
 * @example 
 * type UndefinedOnly<{ a: string }> = { }
 * type UndefinedOnly<{ a?: string }> = { a?: string | undefined }
 * type UndefinedOnly<{ a: string | undefined }> = { a: string | undefined }
 */
export type UndefinedOnly<T, U = undefined> = {
    [K in keyof T as U extends T[K] ? K : never]: T[K]
}