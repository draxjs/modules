import type {IPasswordPolicy} from "@drax/identity-share";

const defaultPasswordPolicy: IPasswordPolicy = {
    minLength: 6,
    maxLength: 64,
    requireUppercase: false,
    requireLowercase: false,
    requireNumber: false,
    requireSpecialChar: false,
    allowedSpecialChars: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
    disallowSpaces: true,
    preventReuse: 3,
    expirationDays: null
}

export {
    defaultPasswordPolicy
}
