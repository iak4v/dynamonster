type TValue = "string" | "number" | "boolean";
export type IValue<T extends TValue> = T extends "string"
    ? string
    : T extends "number"
    ? number
    : T extends "boolean"
    ? boolean
    : never;

type EntityKey = "hashKey" | "rangeKey" | ""

export class M<
    T extends TValue = any,
    Key extends EntityKey = "",
    Indices extends Record<string, "hashKey" | "rangeKey"> = {},
    IsOptional extends boolean = false,
    HasDefault extends boolean = false,
> {

    declare __type__: T;
    declare __default__: IValue<T> | (() => IValue<T>);
    __optional__ = false;
    declare __validateFnMap__?: Map<string, (val: IValue<T>) => boolean>;

    // declare __type__: T;
    __key__: EntityKey = "";

    static string() {
        const i = new M<"string">();
        i.__type__ = "string";
        return i;
    }
    static number() {
        const i = new M<"number">();
        i.__type__ = "number";
        return i;
    }
    static boolean() {
        const i = new M<"boolean">();
        i.__type__ = "boolean";
        return i;
    }

    hashKey() {
        this.__key__ = "hashKey";
        return this as M<T, "hashKey">
    }
    rangeKey() {
        this.__key__ = "rangeKey";
        return this as M<T, "rangeKey">
    }

    lsi(indexName: string) { return this; }
    gsi<I extends string>(indexName: I) {
        return {
            hashKey: () => this as M<T, Key, Indices & { [P in I]: "hashkey" }>,
            rangeKey: () => this as M<T, Key, Indices & { [P in I]: "rangeKey" }>
        }
    }

    minLength(num: number) {
        if (this.__validateFnMap__ === undefined) this.__validateFnMap__ = new Map();
        this.__validateFnMap__.set("minLength", (val) => (val as string).length >= num)
        return this
    }
    maxLength(num: number) {
        if (this.__validateFnMap__ === undefined) this.__validateFnMap__ = new Map();
        this.__validateFnMap__.set("maxLength", (val) => (val as string).length <= num)
        return this
    }
    length(num: number) {
        if (this.__validateFnMap__ === undefined) this.__validateFnMap__ = new Map();
        this.__validateFnMap__.set("length", (val) => (val as string).length === num)
        return this
    }
    regex(regex: RegExp) {
        if (this.__validateFnMap__ === undefined) this.__validateFnMap__ = new Map();
        this.__validateFnMap__.set("regex", (val) => regex.test(val as string))
        return this
    }

    default(value: IValue<T> | (() => IValue<T>)) {
        this.__default__ = value;
        return this as M<T, Key, Indices, IsOptional, true>
    }
    optional() {
        this.__optional__ = true;
        return this as unknown as M<T, '', Indices, true, HasDefault>
    }

    // utils
    prefix(value: string) { return this }
    suffix(value: string) { return this }

    parse(val?: any) {
        let finalValue: IValue<T> = val;
        if (finalValue === undefined && this.__default__ !== undefined) {
            if (typeof this.__default__ === "function") finalValue = (this.__default__ as () => IValue<T>)();
            else finalValue = this.__default__;
        }

        if (!this.__optional__ && finalValue === undefined) throw new Error(`${typeof finalValue} cannot be assigned to ${this.__type__}`)
        else if (finalValue !== undefined && typeof finalValue !== this.__type__) throw new Error(`${typeof finalValue} cannot be assigned to ${this.__type__}`);

        if (this.__validateFnMap__ !== undefined) this.__validateFnMap__.keys().forEach(k => {
            const fn = this.__validateFnMap__!.get(k)!;
            if (fn(finalValue) === false) throw new Error(`Cannot satisfy '${k}' constraint by passing value = ${val}`)
        })
        return finalValue;
    }
}