import { col, type binary as Tbinary, type map as Tmap } from "./col";
import { Table } from "./table";
import { dynamonster } from "./dynamonster";
import { Entity } from "./entity";

export const string = (colName?: string) => {
    const c = new col<string>(colName);
    c.$typeOfValue = 'S'
    return c;
}

export const number = (colName?: string) => {
    const c = new col<number>(colName);
    c.$typeOfValue = 'N'
    return c;
}

export const boolean = (colName?: string) => {
    const c = new col<boolean>(colName);
    c.$typeOfValue = 'BOOL'
    return c;
}

export const binary = (colName?: string) => {
    const c = new col<Tbinary>(colName);
    c.$typeOfValue = 'B'
    return c;
}

export const map = <M>(colName?: string) => {
    const c = new col<Tmap<M>>(colName);
    c.$typeOfValue = 'M'
    return c;
};

export const nul = (colName?: string) => {
    const c = new col<null>(colName);
    c.$typeOfValue = 'NULL'
    return c;
}

// export const map = <M>(colName: string, type: Record<string, col>) => {
//     const c = new col<Tmap<M>>(colName);
//     c.$typeOfValue = 'M'
//     return c;
// };

export const table = <T extends Record<string, col>>(name: string, entity: T) =>
    new Table<T>(name, entity);

export const entity = <T extends Record<string, col>>(schema: T) => new Entity(schema);

export {
    dynamonster
}