import type { M } from "@/monster";

export class Entity<T extends Record<string, M> = Record<string, M>> {
    declare __schema__: T;
    __hashKey__: string = "";
    __rangeKey__?: string;

    constructor(schema: T) {
        this.__schema__ = schema;
        for (const [k, v] of Object.entries(schema)) {
            if (v.__key__ === "hashKey") this.__hashKey__ = k;
            else if (v.__key__ === "rangeKey") this.__rangeKey__ = k;
        };
        if (!this.__hashKey__) throw new Error("Entity does not have any `hashKey`")
    }
}