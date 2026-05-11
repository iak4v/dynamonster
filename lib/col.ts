import { EntityError, ValidationError } from "./error";
import type { DDBValue, Type } from "./types";

export type binary = Uint8Array;
export type map<T> = T;

export type ColValue = string | number | boolean | binary | map<unknown> | null;
// export type AllColValue = string | number | boolean | binary | map<unknown> | (string | number | binary | boolean)[] | Set<string | number | binary> | null;
export type ColConfig = {
    IsHashKey: boolean;
    IsRangeKey: boolean;
    HasDefault: boolean;
    HasOnUpdate: boolean;
    IsArray: boolean;
    IsSet: boolean;
    IsOptional: boolean;
    GSI: boolean,
    LSI: boolean,
};

type UpdateConfig<C extends ColConfig, U extends Partial<ColConfig>> = Omit<C, keyof U> & U;

export class col<
    V extends ColValue = ColValue,
    C extends ColConfig = {
        IsHashKey: false;
        IsRangeKey: false;
        HasDefault: false;
        HasOnUpdate: false;
        IsArray: false;
        IsSet: false;
        IsOptional: false;
        GSI: false,
        LSI: false,
    },
> {
    constructor(name = '') {
        this.name = name;
    }

    name: string;
    $default?: Type<this>
    $isOptional: boolean = false;
    $isHashKey: boolean = false;
    $isRangeKey: boolean = false;
    $typeOfValue: DDBValue = "NULL";
    $validations: { constraint: string, fn: (value: any) => true }[] = []
    $prefix?: { prefix: string, delimiter: string };
    $suffix?: { suffix: string, delimiter: string };
    $onUpdate?: () => Type<this>
    $gsi?: { index: string };
    $lsi?: { index: string };

    default(value: Type<this>): col<V, UpdateConfig<C, { HasDefault: true }>> {
        this.$default = value;
        return this as any;
    }

    gsi(options: { index: string }): col<V, UpdateConfig<C, { GSI: true }>> {
        this.$gsi = options;
        return this as any;
    }

    lsi(options: { index: string }): col<V, UpdateConfig<C, { LSI: true }>> {
        this.$lsi = options;
        return this as any;
    }

    onUpdate(fn: () => Type<this>): col<V, UpdateConfig<C, { HasOnUpdate: true }>> {
        this.$onUpdate = fn;
        return this as any;
    }

    hashKey(this: col<string | number, C>): col<V, UpdateConfig<C, { IsHashKey: true }>> {
        if (this.$isHashKey) throw new EntityError("entity must have 1 hashKey, recieved more than 1");
        if (!['S', 'N'].includes(this.$typeOfValue)) throw new EntityError("hashKey can only be either `string` or `number` type")
        this.$isHashKey = true;
        return this as any;
    }

    prefix(this: col<string, C>, prefix: string, delimiter = '#'): col<V, C> {
        this.$prefix = { prefix, delimiter };
        return this as any;
    }

    suffix(this: col<string, C>, suffix: string, delimiter = '#'): col<V, C> {
        this.$suffix = { suffix, delimiter }
        return this as any;
    }

    rangeKey(this: col<string | number, C>): col<V, UpdateConfig<C, { IsRangeKey: true }>> {
        if (this.$isRangeKey) throw new EntityError("entity must have 1 rangeKey, recieved more than 1")
        this.$isRangeKey = true;
        return this as any;
    }

    optional(): col<V, UpdateConfig<C, { IsOptional: true }>> {
        this.$isOptional = true;
        return this as any;
    }

    set(this: col<string | number | binary, C>): col<V, UpdateConfig<C, { IsSet: true }>> {
        this.$typeOfValue += 'S';
        return this as any;
    }

    array(
        this: col<string | number | boolean | binary | map<any>, C>,
    ): col<V, UpdateConfig<C, { IsArray: true }>> {
        this.$typeOfValue = 'L';
        return this as any;
    }

    maxLength(this: col<string | any[], C>, length: number): col<V, C> {
        this.$validations.push({
            constraint: 'maxLength',
            fn: (input) => {
                if (input.length > length) throw new ValidationError(`length must not be more than ${length}, but received ${input.length}`)
                return true
            }
        })
        return this as any;
    }

    minLength(this: col<string | any[], C>, length: number): col<V, C> {
        this.$validations.push({
            constraint: 'minLength',
            fn: (input) => {
                if (input.length < length) throw new ValidationError(`length must not be less than ${length}, but received ${input.length}`)
                return true
            }
        })
        return this as any;
    }

    length(this: col<string | any[], C>, length: number): col<V, C> {
        this.$validations.push({
            constraint: 'length',
            fn: (input) => {
                if (input.length !== length) throw new ValidationError(`length must be exactly equal to ${length}, but received ${input.length}`)
                return true
            }
        })
        return this as any;
    }

    regex(this: col<string, C>, pattern: RegExp): col<V, C> {
        this.$validations.push({
            constraint: 'regex',
            fn: (input) => {
                if (!pattern.test(input)) throw new ValidationError(`regex pattern ${pattern} did not match with input '${input}'`)
                return true
            }
        })
        return this as any;
    }

    min(this: col<number, C>, value: number): col<V, C> {
        this.$validations.push({
            constraint: 'min',
            fn: (input) => {
                if (input > value) throw new ValidationError(`min value is ${value}, but recieved ${input} `)
                return true
            }
        })
        return this as any;
    }

    max(this: col<number, C>, value: number): col<V, C> {
        this.$validations.push({
            constraint: 'max',
            fn: (input) => {
                if (input < value) throw new ValidationError(`max value is ${value}, but recieved ${input} `)
                return true
            }
        })
        return this as any;
    }

    /**
     * Define a custom validate function that will be used to validate column value before creation and updation of an item
     * @param fn validator function (used before creation and updation of an item)
     * @example 
     * validate(input => {
     *     if (!input.startsWith("H")) throw new Error("Value should starts with 'H'")
     *     return true;
     * })
     */
    validate(fn: (input: Type<this>) => true): col<V, C> {
        this.$validations.push({ constraint: 'validate', fn })
        return this as any
    }
}

export const parse = <C extends col>(col: C, value: Type<C>): Type<C> | undefined => {
    let result: typeof value | undefined = value;

    if (value === undefined) {
        if (col.$default !== undefined) result = col.$default;
        else if (col.$isOptional === false) throw new ValidationError("undefined value is not allowed in a non-optional column field, either make this column optional or provide a defined value")
        else result = undefined;
    }

    if (col.$typeOfValue === "S" && col.$prefix !== undefined) {
        const { prefix, delimiter } = col.$prefix;
        // @ts-ignore
        result = prefix + delimiter + value;
    }

    if (col.$typeOfValue === "S" && col.$suffix !== undefined) {
        const { suffix, delimiter } = col.$suffix;
        // @ts-ignore
        result = value + delimiter + suffix;
    }

    if (!col.$validations) return result;
    for (const c of col.$validations) {
        const v = c['fn'](value);
        if (v !== true) throw new ValidationError(
            `input = ${value}\n` +
            `validation fn = ${c['fn']}` +
            `expected value = true` +
            `recieved value = ${v}`
        )
    };

    return result;
}