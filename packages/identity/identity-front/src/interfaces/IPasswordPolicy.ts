interface IPasswordPolicy {
    minLength: number
    maxLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumber: boolean
    requireSpecialChar: boolean
    disallowSpaces: boolean
    preventReuse: number
    expirationDays: number | null
}

export type {IPasswordPolicy}
