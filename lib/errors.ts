class DynamonsterError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "DynamonsterError";
    }
}

export class DynamonsterParseError extends DynamonsterError {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "DynamonsterParseError"
    }
}

export class DynamonsterDBClientNotInitializedError extends DynamonsterError {
    constructor() {
        super("Dynamonster DB client not initialized. Please provide a valid DB client when initializing Dynamonster.");
        this.name = "DynamonsterDBClientNotInitializedError";
    }
}

// export class DynamonsterItemNotFoundError extends DynamonsterError {
//     constructor(pk: string, additionalInfo: { sk?: string, entity: Entity }) {
//         super(`No item with ${additionalInfo.entity._pkAttribute}=${pk} ${additionalInfo.sk ? `& ${additionalInfo.entity._skAttribute}=${additionalInfo.sk} ` : ''}found`)
//         this.name = "DynamonsterItemNotFoundError";
//     }
// }

export class DynamonsterValidationError extends DynamonsterError {
    constructor(message: string) {
        super(message);
        this.name = "DynamonsterValidationError";
    }
}

export class DynamonsterInvalidOperationError extends DynamonsterError {
    constructor(message: string) {
        super(message);
        this.name = "DynamonsterInvalidOperationError";
    }
}