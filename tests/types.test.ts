import { test, expect, describe } from "bun:test";
import { Entity, m } from "@/index";
test("entity", () => {
    const entity = Entity({
        hashKey: m.string().hashKey(),
        rangeKey: m.string().rangeKey(),
        lsi1: m.string().lsi("lsi1"),
        lsi2: m.number().lsi("lsi2"),
        gsi1hk: m.string().gsi("gsi1").hashKey(),
        gsi1rk: m.string().gsi("gsi1").rangeKey(),
        optional: m.string().optional(),
        default: m.string().default("ok")
    });
    type E = m.infer<typeof entity>;

    const optionalDefault: E = {
        hashKey: "",
        rangeKey: "",
        lsi1: "",
        lsi2: 9,
        gsi1hk: "",
        gsi1rk: "",
        // default: "",
        // optional: ""
    }
    console.log(optionalDefault)
})