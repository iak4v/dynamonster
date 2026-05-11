import { KeyType, ScalarAttributeType, type PutItemCommandInput } from "@aws-sdk/client-dynamodb";
import { parse, type col } from "./col";
import { EntityError, ValidationError } from "./error";

export class Entity<T extends Record<string, col>> {
    $defaults: string[];
    $keys: {
        [KeyType.HASH]: { name: string, type: ScalarAttributeType },
        [KeyType.RANGE]?: { name: string, type: ScalarAttributeType },
    };

    /**
     * key mapping from ddb col name to schema col name
     */
    $mapping: Record<string, string>;

    /** schema to validate the data input */
    private $schema: Record<string, col>;

    constructor(schema: T) {
        this.$schema = schema;
        const $keys: Partial<typeof this.$keys> = {};

        /** mapping of db col name -> schema col name */
        const $mapping: Record<string, string> = {};

        /** array of db col names whose default is defined */
        const $defaults = [];

        for (const k in schema) {
            const c = schema[k] as col;
            if (c.name === '') c.name = k;
            else $mapping[c.name] = k;

            if (c.$default !== undefined) $defaults.push(c.name);

            if (c.$isHashKey) {
                if ($keys[KeyType.HASH] !== undefined) throw new EntityError("entity must have 1 hashKey, received more than 1")
                else $keys[KeyType.HASH] = { name: c.name, type: c.$typeOfValue as unknown as ScalarAttributeType }
            }

            if (c.$isRangeKey) {
                if ($keys[KeyType.RANGE] !== undefined) throw new EntityError("entity must have either 0 or 1 rangeKey, received more than 1")
                else $keys[KeyType.RANGE] = { name: c.name, type: c.$typeOfValue as unknown as ScalarAttributeType }
            }
        }

        if ($keys.HASH === undefined) throw new EntityError("entity must have 1 hashKey, received 0")
        this.$keys = $keys as Required<typeof this.$keys>;

        this.$mapping = $mapping;
        this.$defaults = $defaults;
    }

    /**
     * validates object that will be stored in the table
     * @param obj Object that needs to be validated
     * @returns Object in accordance with entity schema
     */
    validate(obj: Partial<T>, onlyKeys = false) {
        const result: Record<string, any> = {};

        for (const k in this.$schema) {
            const c = this.$schema[k];
            if (!c || !c.name) continue;

            const value = obj[k] ?? undefined;

            if (!(k in obj)) {
                if (c.$default === undefined) continue;
                result[c.name] = parse(c, value);
                continue;
            };

            result[c.name] = parse(c, value);
        }

        if (onlyKeys) {
            const onlyKeysResult: Record<string, any> = {};

            const { name } = this.$keys['HASH']
            onlyKeysResult[name] = result[name];

            if (this.$keys['RANGE']) {
                const { name } = this.$keys['RANGE'];
                onlyKeysResult[name] = result[name]
            }

            return onlyKeysResult;
        }

        return result;
    }

    col<K extends keyof T>(k: K): T[K] {
        const c = this.col(k);
        if (c === undefined) throw new EntityError(`no column with key of \`${String(k)}\` is present in schema`)
        return c;
    }

    /**
     * Takes unmarshalled object as input and cleans it, ie. removes prefix, suffix from the data if any. 
     * @param obj Object that needs to be cleaned
     * @returns object in accordance with the entity schema
     */
    $unparse(obj: Record<string, any>) {
        const result: Record<string, any> = {};

        for (const dk in obj) {
            const key = this.$mapping[dk];
            const c = this.$schema[key ?? dk];

            if (!c) continue;

            let value = obj[dk];

            if (c.$typeOfValue === "S" && c.$prefix) {
                const { delimiter } = c.$prefix;
                const delimiterIndex = (value as string).indexOf(delimiter);
                if (delimiterIndex) {
                    const val = (value as string).slice(delimiterIndex + 1);
                    value = val;
                }
            }

            if (c.$suffix) {
                const { delimiter } = c.$suffix;
                const delimiterIndex = (value as string).indexOf(delimiter);
                if (delimiterIndex) {
                    const val = (value as string).slice(0, delimiterIndex);
                    value = val;
                }
            }

            if (value === null) {
                switch (c.$typeOfValue) {
                    case "S": value = ''; break;
                    case "N": value = 0; break;
                    case "B": value = new Uint8Array(); break;
                    case "SS": value = new Set(); break;
                    case "NS": value = new Set(); break;
                    case "BS": value = new Set(); break;
                    case "M": value = {}; break;
                    case "L": value = []; break;
                    case "NULL": value = null; break;
                    case "BOOL": value = false; break;
                    case "$unknown": value = undefined; break;
                }
            }

            result[key ?? dk] = value;
        }

        return result;
    }
}