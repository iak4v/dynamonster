import { convertToAttr, marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import type { col } from "./col";
import type { Table } from "./table";
import type { DefinedOnly, Either, OverrideValue, PickColIsOptionalOnly, PickOnly, TableData, UndefinedOnly } from "./types";

import { UpdateItemCommand, DeleteItemCommand, PutItemCommand, GetItemCommand, ScanCommand, QueryCommand, type GetItemCommandInput, type AttributeValue, BatchGetItemCommand, ExecuteTransactionCommand } from "@aws-sdk/client-dynamodb";
import { ddb } from "./dynamonster";
import { Errors, OperationError } from "./error";
// import type { UpdateItemCommandInput, DeleteItemCommandInput, PutItemCommandInput, GetItemCommandInput, ScanCommandInput, QueryCommandInput } from "@aws-sdk/client-dynamodb";

import { TransactGetItemsCommand, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";
import { Filter } from "./filter";

type Command = UpdateItemCommand | DeleteItemCommand | PutItemCommand | GetItemCommand | ScanCommand | QueryCommand;
// type CommandInput = UpdateItemCommandInput | DeleteItemCommandInput | PutItemCommandInput | GetItemCommandInput | ScanCommandInput | QueryCommandInput;

type Output<Result = {} | null, Err extends Error = Error> = {
    result?: Result,
    exists?: boolean,
    error?: Err,
    success?: boolean,
    count?: number,
    scannedCount?: number,
    lastEvaluatedKey?: any,
}

type PickFrom<T, R extends keyof T, NR extends keyof T> = Required<Pick<T, R>> & Partial<Pick<T, NR>>

export class Op<
    T extends Table<any>,
    Data extends TableData<T> = TableData<T>,
    Method extends 'get' | 'put' | 'delete' | 'update' | 'scan' | 'query' | 'exists' | 'all' = 'all'
> {
    private $table: Table<any>

    constructor(table: T) {
        this.$table = table;
    }

    private async validation() {
        const ddbClient = ddb.get();
        if (ddbClient === null) throw Errors.SetUpError;
        if (this.$table.exists === false) await this.$table.create();

        return { ddbClient }
    }

    async get<A extends keyof Data['Entity']>(
        keys: Data['Keys'],
        attributes?: A[]
    ): Promise<Either<Output<Pick<Data['Entity'], undefined extends A ? keyof Data['Entity'] : A>>, "result", "error">> {
        const { ddbClient } = await this.validation();

        const keysParsed = this.$table.entity.validate(keys, true);

        const command = new GetItemCommand({
            TableName: this.$table.name,
            Key: marshall(keysParsed),
        });

        if (attributes) (command.input as GetItemCommandInput).ProjectionExpression = attributes
            .map(a => (this.$table.entity.col(a).name))
            .join(', ')

        const result = await ddbClient
            .send(command)
            .then(r => {
                const { Item } = r;
                if (Item === undefined) return null;
                return this.$table.entity.$unparse(unmarshall(Item))
            }) as Pick<Data['Entity'], undefined extends A ? keyof Data['Entity'] : A>

        if (result === null) return { result: undefined, error: new OperationError(`item not found with primary keys: \`${Object.entries(keys).map(([k, v]) => `${k} = ${v}`).join(' & ')}\``) }
        return { result };
    }

    async exists(keys: Data['Keys']): Promise<Required<Pick<Output, 'exists'>>> {
        const { ddbClient } = await this.validation();

        const keysParsed = this.$table.entity.validate(keys, true);

        const command = new GetItemCommand({
            TableName: this.$table.name,
            Key: marshall(keysParsed),
            // ProjectionExpression: Object.entries(keysParsed).map(([k]) => k).join(",")
        });

        const result = await ddbClient
            .send(command)
            .then(r => {
                const { Item } = r;
                if (Item !== undefined) return true;
                return false;
            });

        return { exists: result }
    }

    async delete(keys: Data['Keys']): Promise<Required<Pick<Output, 'success'>>> {
        const { ddbClient } = await this.validation();

        const keysParsed = this.$table.entity.validate(keys, true);

        const command = new DeleteItemCommand({
            TableName: this.$table.name,
            Key: marshall(keysParsed),
            // TODO: range key in ConditionExpression
            ConditionExpression: `attribute_exists(${this.$table.entity.$keys['HASH'].name})`,
        });

        const result = await ddbClient.send(command).then(r => {
            if (r.$metadata.httpStatusCode === 200) return true;
            return false;
        }).catch(e => {
            if (e instanceof Error && e.name === 'ConditionalCheckFailedException') return false;
            return false;
        })

        return { success: result };
    }

    async put(body: Data['Entity']): Promise<Required<Pick<Output, "success">>> {
        const { ddbClient } = await this.validation();

        const bodyTransformed = this.$table.entity.validate(body);
        console.log(bodyTransformed)
        const command = new PutItemCommand({
            TableName: this.$table.name,
            Item: marshall(bodyTransformed, { convertEmptyValues: true }),
            ConditionExpression: `attribute_not_exists(${this.$table.entity.$keys['HASH'].name})`,
        })

        const result = await ddbClient
            .send(command)
            .then(r => {
                if (r.$metadata.httpStatusCode === 200) return true;
                return false;
            })
            .catch(e => {
                if (e instanceof Error && e.name === "ConditionalCheckFailedException") return false;
                return false;
            })

        return { success: result }
    }

    /**
     * Update an existing item in the table
     * @param keys primary keys (comprising hash and sort key) of item
     * @param body update item values
     * 
     * @throws NotFoundError - if item with provided primary key does not exists
     */
    async update(
        keys: Data['Keys'],
        body: Partial<{
            /**
             * Updates values in of an existing item 
             * @abstract before {name: "old name"}, after {name: "new name"}
             */
            set: Partial<Data['Entity']>,
            // also increments number `SET #count = #count + n`
            // also appends item to list `SET #list = list_append(#list, , :newItem)`

            /**
             * Clear the key-value pair from an item, works for only `optional()` // TODO: optional
             * @external
             * `REMOVE #attr` in `UpdateItemCommand`
             */
            clear: (keyof PickColIsOptionalOnly<T>)[],

            /**
             * Removes value on the `nth` index of an array
             * @external
             * `REMOVE #stringArray[n]` 
             */
            pop: Partial<OverrideValue<PickOnly<Data['Entity'], any[]>, number[]>>
            // also removes item from list `REMOVE #list[0]`

            /**
             * Increments value of number by given input (only work with number values)
             * @example 
             * increment({ totalLikes: 8 })
             * increment({ totalLikes: -1 })
             */
            increment: Partial<PickOnly<Data['Entity'], number>>,

            /**
             * Works with Array data types only
             */
            push: Partial<PickOnly<Data['Entity'], any[]>>,

            /**
             * Works with Set data types only
             */
            add: Partial<PickOnly<Data['Entity'], Set<any>>>,

            /**
             * Works with Set only
             */
            delete: Partial<PickOnly<Data['Entity'], Set<any>>>,
        }>
    ) {
        const { ddbClient } = await this.validation();
        const parsedKeys = this.$table.entity.validate(keys, true);

        type UpdateMethods = "SET" | "DELETE" | "ADD" | "REMOVE";
        const methods: Record<UpdateMethods, string> = {
            SET: '',
            DELETE: '',
            ADD: '',
            REMOVE: '',
        };

        let ExpressionAttributeValues: Record<string, AttributeValue> = {};

        if (body.set) {
            const set = [];

            for (const k in body.set) {
                const c = this.$table.entity.col(k);
                set.push(`${c.name}=:${c.name}`);
            }

            methods.SET += set.join(', ')
        }

        if (body.increment || body.add) {
            const add = [];
            const iterable = { ...body.add, ...body.increment }
            for (const k in iterable) {
                const c = this.$table.entity.col(k);
                add.push(`${c.name} :${c.name}`)
            }
            methods.ADD += add.join(', ')
        }

        if (body.delete) {
            const _delete = [];
            for (const k in body.delete) {
                const c = this.$table.entity.col(k);
                _delete.push(`${c.name} :${c.name}`)
            }
            methods.DELETE += _delete.join(", ")
        }

        if (body.push) {
            const set = [];
            for (const k in body.push) {
                const c = this.$table.entity.col(k);
                set.push(`${c.name}=list_append(${c.name}, :${c.name})`)
            }
            methods.SET += set.join(", ")
        }

        if (body.pop) {
            const remove = [];
            for (const k in body.pop) {
                const c = this.$table.entity.col(k);
                remove.push(body.pop[k]!.map(n => `${c.name}[${n}]`).join(' '))
            }
            methods.REMOVE += remove.join(", ")
        }

        let UpdateExpression = '';
        for (const k in methods) {
            const value = methods[k as UpdateMethods];
            if (value) UpdateExpression += `${k} ${value} `;
        }

        const iterable = { ...body.set, ...body.add, ...body.increment, ...body.delete, ...body.push };
        for (const k in iterable) {
            const c = this.$table.entity.col(k);
            ExpressionAttributeValues[`:${c.name}`] = convertToAttr(iterable[k])
        }

        const command = new UpdateItemCommand({
            TableName: this.$table.name,
            Key: marshall(parsedKeys),
            UpdateExpression: UpdateExpression.trimEnd(),
            ExpressionAttributeValues: Object.keys(ExpressionAttributeValues).length ? ExpressionAttributeValues : undefined,
        })

        return ddbClient.send(command).then(() => { }).catch(e => { console.log({ e }) })
    }

    async scan<A extends keyof Data['Entity']>(options: {
        limit?: number,
        startAt?: any,
        attributes?: A[],
        where: Filter
    }): Promise<Pick<Output, 'result' | 'count' | 'scannedCount' | 'lastEvaluatedKey'> | Pick<Output, 'error'>> {
        const { ddbClient } = await this.validation();
        // const params: ScanCommandInput = {
        //     TableName: "YourTableName",
        //     FilterExpression: "contains(title, :keyword)", // Case-sensitive
        //     ExpressionAttributeValues: {
        //         ":keyword": { S: "best" }, // Using "best" (case-sensitive)
        //     },
        //     Limit: 5, // Stop after 5 items
        // };

        const { fe, eav } = options.where;

        const command = new ScanCommand({
            TableName: this.$table.name,
            Limit: options.limit,
            FilterExpression: fe,
            ExpressionAttributeValues: eav,
        })

        if (options.attributes) (command.input as GetItemCommandInput).ProjectionExpression = options.attributes
            .map(a => this.$table.entity.col(a).name)
            .join(', ')

        return ddbClient
            .send(command)
            .then(r => ({
                count: r.Count,
                scannedCount: r.ScannedCount,
                lastEvaluatedKey: r.LastEvaluatedKey,
                result: (r.Items)?.map((d) => this.$table.entity.$unparse(unmarshall(d))),
                error: undefined
            }) as Pick<Output, 'result' | 'count' | 'scannedCount' | 'lastEvaluatedKey'>)
            .catch(e => ({
                error: e,
                result: undefined
            }) as Pick<Output, 'error'>)

    }
    async query() { }

    /**
     * For custom commands, can be used if `dynamonster` methods doesn't fulfil your requirements
     */
    async exec(command: GetItemCommand | PutItemCommand | DeleteItemCommand | ScanCommand | QueryCommand | BatchGetItemCommand) {
        const { ddbClient } = await this.validation();

        // @ts-ignore
        return ddbClient.send(command);
    }

    async transaction() {
        // const { ddbClient } = await this.validation();

        // ddbClient.send(new TransactWriteItemsCommand({
        //     TransactItems: [
        //         {
        //             Put: 
        //         }
        //     ]
        // }))

        // ddbClient.send(new TransactGetItemsCommand({
        //     TransactItems: [
        //         {Get: }
        //     ]
        // }))
    }
}