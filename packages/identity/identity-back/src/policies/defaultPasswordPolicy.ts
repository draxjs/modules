import type {IPasswordPolicy} from "@drax/identity-share/dist";

const defaultPasswordPolicy: IPasswordPolicy = {
    minLength: 8,
    maxLength: 64,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: false,
    disallowSpaces: true,
    preventReuse: 3,
    expirationDays: null
}

export {
    defaultPasswordPolicy
}
