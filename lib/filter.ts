import type { AttributeValue } from "@aws-sdk/client-dynamodb";
import type { col } from "./col";
import { convertToAttr } from "@aws-sdk/util-dynamodb";

export class Filter {
    fe: string;
    eav: Record<string, AttributeValue>

    constructor(options: { fe: string, eav: Record<string, AttributeValue> }) {
        this.fe = options.fe;
        this.eav = options.eav;
    }
}

/**
 * only works with String and Set data types
 * @param col entity column on which filter expression will be defined
 * @param value 
 */
export const contains = (col: col<string | Set<any>>, value: string) => {
    return new Filter({
        fe: `contains(${col.name}, :contains_${col.name})`,
        eav: { [`:contains_${col.name}`]: convertToAttr(value) }
    })
}

export const beginsWith = (col: col<string>, value: string) => {
    return new Filter({
        fe: `begins_with(${col.name}, :beginsWith_${col.name})`,
        eav: { [`:beginsWith_${col.name}`]: convertToAttr(value) }
    })
}

export const and = (f1: Filter, f2: Filter) => {
    const { fe: fe1, eav: eav1 } = f1;
    const { fe: fe2, eav: eav2 } = f2;
    return new Filter({
        fe: `${fe1} AND ${fe2}`,
        eav: { ...eav1, ...eav2 }
    })
}

export const or = (f1: Filter, f2: Filter) => {
    const { fe: fe1, eav: eav1 } = f1;
    const { fe: fe2, eav: eav2 } = f2;
    return new Filter({
        fe: `${fe1} OR ${fe2}`,
        eav: { ...eav1, ...eav2 }
    })
}

