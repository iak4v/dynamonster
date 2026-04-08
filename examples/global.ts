import { Table, Entity, m } from "@/index";

const GlobalEntity = Entity({
    pk: m.string().hashKey(),
    sk: m.string().rangeKey(),
    lsi1: m.string().lsi('lsi1'),
    gsi1hk: m.string().gsi("gsi1").hashKey(),
    gsi1rk: m.string().gsi("gsi1").rangeKey(),
});

const Global = Table({
    entity: GlobalEntity,
    config: { tableName: "global-db" }
})

const createdEntry = await Global.create({});