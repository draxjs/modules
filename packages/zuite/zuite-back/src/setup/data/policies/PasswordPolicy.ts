import type {IPasswordPolicy} from "@drax/identity-share";

const projectPasswordPolicy: IPasswordPolicy = {
    minLength: 16,
    maxLength: 32,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
    disallowSpaces: true,
    preventReuse: 3,
    expirationDays: null
}

export {
    projectPasswordPolicy
}
