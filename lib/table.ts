import type { Entity } from "@/entity";
import { Dynamonster, m } from "@/index";
import { UpdateItemCommand, PutItemCommand, type PutItemCommandInput, type CreateTableCommandInput, CreateTableCommand, ScalarAttributeType, DeleteItemCommand, type DeleteItemCommandInput, type GetItemCommandInput, GetItemCommand } from "@aws-sdk/client-dynamodb";
import type { M } from "./monster";

type TableOperation = "get" | "create" | "update" | "delete" | "scan" | "query" | "";

type ITable<
    E extends Entity,
    T extends TableOperation,
    ReturnType = {}
> =
    { go: () => Promise<ReturnType> } & (T extends "create"
        ? {}
        : T extends "get"
        ? { attributes: <K = E extends Entity<infer U> ? keyof U : never>(...attributes: K[]) => ITable<E, T, {}> }
        : T extends "update"
        ? { set: () => void, add: () => void }
        : T extends "delete"
        ? {}
        : T extends "scan"
        ? {}
        : T extends "query"
        ? {}
        : never)

export enum DBValueType {
    S = 'S',
    N = 'N',
    B = 'B',
    SS = 'SS',
    NS = 'NS',
    BS = 'BS',
    M = 'M',
    L = 'L',
    NULL = 'NULL',
    BOOL = 'BOOL'
}

// FIXME: handle every case
function getType(value: any) {
    switch (typeof value) {
        case "string": return DBValueType.S;
        case "number": return DBValueType.N;
        case "boolean": return DBValueType.BOOL;
    }
    return DBValueType.NULL
}

function getTypeFromM(value: M) {
    switch (value.__type__) {
        case "string": return DBValueType.S;
        case "number": return DBValueType.N;
        case "boolean": return DBValueType.BOOL;
    }
    return DBValueType.NULL
}

export class Table<S extends Entity> {
    ddbCommandInput?: Record<string, any>;
    ddbCommand?: any;
    isTableCreated = false;

    private getCreateTableCommand() {
        const KeySchema: CreateTableCommandInput['KeySchema'] = [{ AttributeName: this.__entity__.__hashKey__, KeyType: "HASH" }];
        const AttributeDefinitions: CreateTableCommandInput['AttributeDefinitions'] = [{
            AttributeName: this.__entity__.__hashKey__,
            AttributeType: getType(this.__entity__.__schema__[this.__entity__.__hashKey__]!.__type__) as ScalarAttributeType
        }]

        if (this.__entity__.__rangeKey__ !== undefined) KeySchema.push({ AttributeName: this.__entity__.__rangeKey__, KeyType: "RANGE" })

        const input: CreateTableCommandInput = {
            TableName: this.__config__.tableName,
            KeySchema,
            AttributeDefinitions,
            BillingMode: "PAY_PER_REQUEST"
        }
        return new CreateTableCommand(input);
    }

    declare __entity__: S;
    declare __config__: TableConfig<S>;

    constructor(
        opts: {
            entity: S,
            config: TableConfig<S>
        }
    ) {
        this.__entity__ = opts.entity;
        this.__config__ = opts.config;
    }

    async go() {
        const ddbClient = Dynamonster.get();
        if (!ddbClient) throw new Error("DDB instance not initialized")

        if (!this.isTableCreated) await ddbClient.send(this.getCreateTableCommand())
            .then(r => {
                this.isTableCreated = true;
                return r
            })
            .catch(() => { }) as any;

        return ddbClient.send(new this.ddbCommand(this.ddbCommandInput));
    }

    create(obj: m.infer<S>) {
        this.ddbCommand = PutItemCommand;
        const Item: Record<string, any> = {};

        for (const [k, m] of Object.entries(this.__entity__.__schema__)) {
            const v = m.parse((obj as { [x: string]: any })[k]);
            if (v !== undefined) Item[k] = { [getTypeFromM(m)]: v }
        }

        this.ddbCommandInput = {
            TableName: this.__config__.tableName,
            Item,
            ConditionExpression: `attribute_not_exists(${this.__entity__.__hashKey__})`
        } satisfies PutItemCommandInput;

        return this as unknown as ITable<S, "create">;
    }

    get(keys: m.inferKeys<S>) {
        this.ddbCommandInput = {
            TableName: this.__config__.tableName,
            Key: Object.fromEntries(Object.entries(keys).map(([k, v]) => [k, { S: v as any }])),
        } satisfies GetItemCommandInput;
        this.ddbCommand = GetItemCommand;
        return this as unknown as ITable<S, "get">;
    }

    update(keys: m.inferKeys<S>) {
        this.ddbCommand = UpdateItemCommand;
        this.ddbCommandInput = {
            TableName: this.__config__.tableName,
            Key: Object.fromEntries(Object.entries(keys).map(([k, v]) => [k, { S: v as any }])),
            ExpressionAttributeNames: {},
            ExpressionAttributeValues: {},
            UpdateExpression: "",
            ConditionExpression: `attribute_exists(${this.__entity__.__hashKey__})`
        };
        return this;
    }

    set<A extends m.infer<S>>(values: Partial<A>) {
        let setExpr = "SET";
        if (!this.ddbCommandInput) throw new Error("Invalid Table Op") // basic command is not called;

        for (const [k, v] of Object.entries(values)) {
            const randomStr = k.slice(0, 2) + String(Math.random()).slice(3, 6);
            const _kn = '#' + randomStr, _kv = ':' + randomStr;
            this.ddbCommandInput.ExpressionAttributeNames[_kn] = k;
            this.ddbCommandInput.ExpressionAttributeValues[_kv] = { [getTypeFromM(this.__entity__.__schema__[k]!)]: v as any };
            setExpr += ` ${_kn}=${_kv},`
        }
        this.ddbCommandInput.ConditionExpression = `attribute_exists(${this.__entity__.__hashKey__})`
        this.ddbCommandInput.UpdateExpression = setExpr.slice(0, -1);
        return this;
    }

    append() { return this }
    remove() { return this }
    clear() { return this }

    delete(keys: m.inferKeys<S>) {
        this.ddbCommand = DeleteItemCommand;
        this.ddbCommandInput = {
            TableName: this.__config__.tableName,
            Key: Object.fromEntries(Object.entries(keys).map(([k, v]) => [k, { [getTypeFromM(this.__entity__.__schema__[k]!)]: v as any }])),
            ConditionExpression: `attribute_exists(${this.__entity__.__hashKey__})`
        } satisfies DeleteItemCommandInput;

        // when item not present
        // ConditionalCheckFailedException: The conditional request failed
        return this;
    }

    scan() { }

    query() { }

    entity(e: Entity) {
        return this;
    }
}

export type TableConfig<S extends Entity = Entity<{}>> = {
    tableName: string,
    // hashKey: S extends Entity<infer T> ? keyof T : never;
    // rangeKey?: S extends Entity<infer T> ? keyof T : never;
}