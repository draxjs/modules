import type {IPasswordPolicy} from "@drax/identity-share";

const projectPasswordPolicy: IPasswordPolicy = {
    minLength: 3,
    maxLength: 32,
    requireUppercase: false,
    requireLowercase: false,
    requireNumber: false,
    requireSpecialChar: true,
    disallowSpaces: false,
    preventReuse: 3,
    expirationDays: null
}

export {
    projectPasswordPolicy
}
