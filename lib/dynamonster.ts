import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import type { Table } from "./table";
import { Op } from "./op";

const ddbFn = () => {
    let client: DynamoDBClient | null = null;

    return {
        get() { return client; },
        set(ddbClient: DynamoDBClient) { client = ddbClient }
    }
}

export const ddb = ddbFn();

export const dynamonster: T = (data) => {
    // @ts-ignore
    if (data.local && data.local.endpoint) ddb.set(new DynamoDBClient({
        // @ts-ignore
        endpoint: data.local.endpoint,
        credentials: {
            accessKeyId: "local",
            secretAccessKey: "local",
        },
        region: "local",
    }))

    // @ts-ignore
    else if (data.dynamoDbClient) ddb.set(data.dynamoDBClient);

    return {
        table: <T extends Table<any>>(table: T) => new Op<T>(table)
    }
}

type T = {
    (data: { dynamoDBClient: DynamoDBClient }): Dynamonster,
    (data: { local: { endpoint: string } }): Dynamonster
}

type Dynamonster = {
    table: <T extends Table<any>>(table: T) => Op<T>
}