import { DynamoDB } from "@aws-sdk/client-dynamodb";

function DynamonsterFn() {
    let ddbInstance: DynamoDB | null = null;

    return {
        get() {
            return ddbInstance
        },
        local(endpoint = "http://localhost:8000") {
            ddbInstance = new DynamoDB({
                endpoint,
                credentials: {
                    accessKeyId: "local",
                    secretAccessKey: 'local'
                },
                region: "local"
            })
        },
        set(dynamoDB: DynamoDB) {
            ddbInstance = dynamoDB
        }
    }
}

const Dynamonster = DynamonsterFn();

export default Dynamonster;