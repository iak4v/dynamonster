import { Table, Entity, m, Dynamonster } from "@/index";

Dynamonster.local();

const User = Table({
    entity: Entity({
        email: m.string().hashKey(),
        name: m.string(),
        age: m.number(),
        isSub: m.boolean().default(false),
        // gsi1hk: m.string().gsi("gsi1")).hashKey(),
        // gsi1rk: m.string().gsi("gsi1".rangeKey(),
    }),
    config: ({ tableName: "user-db" })
})

// const created_entry = await User
//     .create({
//         email: "",
//         name: "",
//         age: 1,
//         isSub: false
//     })
//     .go();

// const get_entity = await User
//     .get()
//     .attributes("")
//     .go();

// const updated_entity = await User
//     .update({})
//     .set({ age: 6 })