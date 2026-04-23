interface IPasswordPolicy {
    minLength: number
    maxLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumber: boolean
    requireSpecialChar: boolean
    /** Caracteres especiales permitidos; `null` o ausente = constante por defecto en identity-share */
    allowedSpecialChars?: string | null
    disallowSpaces: boolean
    preventReuse: number
    expirationDays: number | null
}

type IPasswordPolicyProject = Partial<IPasswordPolicy>

export type {IPasswordPolicy, IPasswordPolicyProject}
