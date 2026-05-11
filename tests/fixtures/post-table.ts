import { map, string } from "@/index";

export const postEntity = {
    id: string("col_hashKey").hashKey().prefix("POST"),
    title: string(),
    seo: map<{ key: string[], description: string }>(),
}