import {randomInt} from "crypto";
import {ZodError, ZodType} from "zod";
import {ValidationError, ZodErrorToValidationError} from "@drax/common-back";
import type {IUser} from "@drax/identity-share";
import type {IUserPasswordHistory} from "../interfaces/IUserPasswordHistory";
import type {IPasswordPolicy} from "@drax/identity-share";
import type UserPasswordHistoryService from "./UserPasswordHistoryService";
import type {IUserRepository} from "../interfaces/IUserRepository";
import AuthUtils from "../utils/AuthUtils.js";
import PasswordPolicyResolver from "../resolver/PasswordPolicyResolver.js";
import PasswordPolicySchemaFactory from "../utils/PasswordPolicySchemaFactory.js";

interface IValidatePasswordOptions {
    field?: string
    userId?: string
    currentPasswordHash?: string
}

class PasswordPolicyService {
    constructor(
        private readonly resolver: PasswordPolicyResolver,
        private readonly userRepository?: IUserRepository,
        private readonly userPasswordHistoryService?: UserPasswordHistoryService
    ) {
    }

    async getFinalPolicy(): Promise<IPasswordPolicy> {
        return this.resolver.resolve()
    }

    async getPasswordSchema(): Promise<ZodType<string>> {
        const policy = await this.getFinalPolicy()
        return PasswordPolicySchemaFactory.create(policy)
    }

    async validatePassword(password: string,  options?: IValidatePasswordOptions): Promise<void> {
        const field = options?.field || "password"
        try {
            const schema = await this.getPasswordSchema()
            await schema.parseAsync(password)
        } catch (e) {
            if (e instanceof ZodError) {
                const validationError = ZodErrorToValidationError(e, {[field]: password})
                validationError.errors = validationError.errors.map((error) => ({...error, field}))
                throw validationError
            }
            throw e
        }

        if (options?.userId) {
            await this.validateReuse(password, options.userId, {
                field,
                currentPasswordHash: options.currentPasswordHash
            })
        }
    }

    async generateCompatiblePassword(): Promise<string> {
        const policy = await this.getFinalPolicy()
        const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        const lowercaseChars = "abcdefghijkmnopqrstuvwxyz"
        const numericChars = "0123456789"
        const specialChars = "!@#$%&*_-+="
        const fallbackSpecial = policy.disallowSpaces ? "!" : " "
        const combinedChars = [
            uppercaseChars,
            lowercaseChars,
            numericChars,
            policy.requireSpecialChar ? specialChars : "",
            policy.disallowSpaces ? "" : " "
        ].join("") || `${uppercaseChars}${lowercaseChars}${numericChars}${fallbackSpecial}`

        const chars: string[] = []

        if (policy.requireUppercase) {
            chars.push(this.randomChar(uppercaseChars))
        }
        if (policy.requireLowercase) {
            chars.push(this.randomChar(lowercaseChars))
        }
        if (policy.requireNumber) {
            chars.push(this.randomChar(numericChars))
        }
        if (policy.requireSpecialChar) {
            chars.push(this.randomChar(specialChars))
        }
        if (!chars.length) {
            chars.push(this.randomChar(`${uppercaseChars}${lowercaseChars}${numericChars}`))
        }

        while (chars.length < policy.minLength) {
            chars.push(this.randomChar(combinedChars))
        }

        const password = this.shuffle(chars).join("").slice(0, policy.maxLength)
        await this.validatePassword(password)
        return password
    }

    async getPasswordExpiration(user: IUser): Promise<{expired: boolean, expiresAt: Date | null}> {
        const policy = await this.getFinalPolicy()
        if (!policy.expirationDays) {
            return {expired: false, expiresAt: null}
        }

        const lastPasswordChange = await this.getLastPasswordChangeDate(user)
        if (!lastPasswordChange) {
            return {expired: false, expiresAt: null}
        }

        const expiresAt = new Date(lastPasswordChange)
        expiresAt.setDate(expiresAt.getDate() + policy.expirationDays)

        return {
            expired: expiresAt.getTime() <= Date.now(),
            expiresAt
        }
    }

    async recordPassword(userId: string, passwordHash: string): Promise<void> {
        await this.userPasswordHistoryService?.create(userId, passwordHash)
    }

    private async validateReuse(password: string, userId: string, options?: {field: string, currentPasswordHash?: string}): Promise<void> {
        const policy = await this.getFinalPolicy()
        if (!policy.preventReuse) {
            return
        }

        const field = options?.field || "password"
        const recentHashes = await this.getRecentPasswordHashes(userId, policy.preventReuse, options?.currentPasswordHash)
        const reused = recentHashes.some((item) => AuthUtils.checkPassword(password, item.passwordHash))
        if (reused) {
            throw new ValidationError([{field, reason: "validation.password.preventReuse"}])
        }
    }

    private async getRecentPasswordHashes(userId: string, limit: number, currentPasswordHash?: string): Promise<IUserPasswordHistory[]> {
        const recent = await this.userPasswordHistoryService?.findLatestByUserId(userId, limit) || []
        const hashes = [...recent]

        if (currentPasswordHash && !hashes.some((item) => item.passwordHash === currentPasswordHash)) {
            hashes.unshift({user: userId, passwordHash: currentPasswordHash})
        } else if (!currentPasswordHash && this.userRepository) {
            const user = await this.userRepository.findByIdWithPassword(userId)
            if (user?.password && !hashes.some((item) => item.passwordHash === user.password)) {
                hashes.unshift({user: userId, passwordHash: user.password})
            }
        }

        return hashes.slice(0, limit)
    }

    private async getLastPasswordChangeDate(user: IUser): Promise<Date | null> {
        if (!user?._id || !this.userPasswordHistoryService) {
            return user?.updatedAt ? new Date(user.updatedAt) : user?.createdAt ? new Date(user.createdAt) : null
        }

        const latest = await this.userPasswordHistoryService.findLatestByUserId(user._id.toString(), 1)
        if (latest[0]?.createdAt) {
            return new Date(latest[0].createdAt)
        }

        return user?.updatedAt ? new Date(user.updatedAt) : user?.createdAt ? new Date(user.createdAt) : null
    }

    private randomChar(source: string): string {
        return source[randomInt(0, source.length)]
    }

    private shuffle(chars: string[]): string[] {
        const items = [...chars]
        for (let i = items.length - 1; i > 0; i -= 1) {
            const j = randomInt(0, i + 1)
            const temp = items[i]
            items[i] = items[j]
            items[j] = temp
        }
        return items
    }
}

export default PasswordPolicyService
export {PasswordPolicyService}
