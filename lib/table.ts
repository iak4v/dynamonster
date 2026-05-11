import { Entity } from "./entity";
import type { col } from "./col";
import { CreateTableCommand, DeleteTableCommand, KeyType, type CreateTableCommandInput } from "@aws-sdk/client-dynamodb";
import { ddb } from "./dynamonster";
import { Errors } from "./error";

export class Table<T extends Record<string, col>> {
    /**
     * Name of the table
     */
    name: string;

    /**
     * Table item entity that will validate and parse the input & output data
     */
    entity: Entity<T>;

    /**
     * Does table exists already
     */
    exists: boolean = false

    constructor(
        name: string,
        entity: T,
    ) {
        this.name = name;
        this.entity = new Entity(entity)
    }

    async create() {
        if (ddb.get() === null) throw Errors.SetUpError;

        const command = new CreateTableCommand({
            TableName: this.name,
            // @ts-ignore
            KeySchema: Object.entries(this.entity.$keys).map(([t, a]) => ({ AttributeName: a.name, KeyType: t })),
            AttributeDefinitions: Object.entries(this.entity.$keys).map(([_, a]) => ({ AttributeName: a.name, AttributeType: a.type })),
            BillingMode: "PAY_PER_REQUEST"
        })

        return ddb.get()!.send(command).then((r) => {
            if (r.$metadata.httpStatusCode === 200) this.exists = true;
            else this.exists = false;
        });

        // TODO: if table already exists, check for compatibility with entity schema
    }

    async delete() {
        if (process.env.NODE_ENV === "production") throw new Error("cannot delete table in production environment, if you really want to delete table, please use aws cli or aws browser console.")

        if (ddb.get() === null) throw Errors.SetUpError;

        const command = new DeleteTableCommand({
            TableName: this.name
        })

        return ddb.get()!.send(command);
    }
}
