interface IPasswordPolicy {
    minLength: number
    maxLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumber: boolean
    requireSpecialChar: boolean
    allowedSpecialChars: string
    disallowSpaces: boolean
    preventReuse: number
    expirationDays: number | null
}

export type {IPasswordPolicy}
