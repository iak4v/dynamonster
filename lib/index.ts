import { Table as DTable, type TableConfig } from "@/table"
import { Entity as DEntity } from "@/entity";
import { M, type IValue } from "./monster";
import Dynamonster from "@/dynamodb";

const Entity = <T extends Record<string, M> = any>(e: T) => new DEntity(e);
const Table = <S extends DEntity>(config: { entity: S, config: TableConfig<S> }) => new DTable(config);

export {
    Entity,
    Table,
    Dynamonster
};


type PickDefined<T> = Pick<T, { [P in keyof T]: undefined extends T[P] ? never : P }[keyof T]>;
type MakeUndefinedToOptional<T> = Partial<Pick<T, { [P in keyof T]: undefined extends T[P] ? P : never }[keyof T]>>;



type _infer<
    E extends DEntity,
    Schema = E extends DEntity<infer R>
    ? {
        [P in keyof R]: R[P] extends M<infer T, any, any, infer IsOptional, infer HasDefault>
        ? true extends IsOptional | HasDefault ? (IValue<T> | undefined) : IValue<T>
        : never
    }
    : never,
    R = PickDefined<Schema> & MakeUndefinedToOptional<Schema>> = R;


type EntityToType<T> = T extends DEntity<infer S> ? { [P in keyof S]: S[P] extends M<infer X, any, any> ? IValue<X> : never } : never;
type ExtractEntityKeys<T, Keys> = T extends DEntity<infer S>
    ? { [P in keyof S]: S[P] extends M<"string", infer K, any> ? K extends Keys ? string : undefined : undefined }
    : never;

export namespace m {
    export type infer<E extends DEntity> = _infer<E>;
    export type inferKeys<T extends DEntity, Keys = 'hashKey' | 'rangeKey'> = PickDefined<ExtractEntityKeys<T, Keys>>;


    export const string = M.string;
    export const number = M.number;
    export const boolean = M.boolean;
}