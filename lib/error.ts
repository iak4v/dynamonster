class DynamonsterError extends Error {
    override name = 'DynamonsterError'
    constructor(message: string) {
        super(message);
    }
}

/**
 * When there's some error regarding configuration in the entity. For example, more than 1 hashKey defined, or more than 1 rangeKey defined etc...
 */
export class EntityError extends DynamonsterError {
    override name = 'DynamonsterEntityError'
    constructor(message: string) {
        super(message);
    }
}

/**
 * For errors regarding input validation in the entity. For example, maxLength, min, regex etc...
 */
export class ValidationError extends DynamonsterError {
    override name = 'DynamonsterValidationError'
    constructor(message: string) {
        super(message);
    }

    static combine(key: string, errors: { name: string, error: ValidationError }[]) {
        const msg = [`${key}: ${errors.length} Validation Errors`]
        for (const e of errors) {
            msg.push(`${e.name}: ${e.error.message}\n`)
        }
        return new ValidationError(msg.join("\n"))
    }
}
/**
 * For errors regarding dynamodb configuration
 */
export class ConfigError extends DynamonsterError {
    override name = 'DynamonsterConfigError'
    constructor(message: string) {
        super(message);
    }
}

/**
 * For errors regarding table operation like `.get` failed because item not found etc.
 */
export class OperationError extends DynamonsterError {
    override name = 'DynamonsterOperationError'
    constructor(message: string) {
        super(message);
    }
}

export const Errors = {
    SetUpError: new ConfigError("set up dynamonster first, `const db = dynamonster(...)`")
}