import type {IPasswordPolicy} from "@drax/identity-share/dist";

const defaultPasswordPolicy: IPasswordPolicy = {
    minLength: 6,
    maxLength: 64,
    requireUppercase: false,
    requireLowercase: false,
    requireNumber: false,
    requireSpecialChar: false,
    allowedSpecialChars: null,
    disallowSpaces: true,
    preventReuse: 3,
    expirationDays: null
}

export {
    defaultPasswordPolicy
}
