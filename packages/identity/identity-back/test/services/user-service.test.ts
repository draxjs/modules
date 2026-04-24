import {beforeEach, describe, expect, it} from "vitest"
import UserService from "../../src/services/UserService";
import type {IUserRepository} from "../../src/interfaces/IUserRepository";
import type {IUser, IUserCreate, IUserUpdate} from "@drax/identity-share";
import {ValidationError} from "@drax/common-back";
import PasswordPolicyResolver from "../../src/resolver/PasswordPolicyResolver";
import PasswordPolicyService from "../../src/services/PasswordPolicyService";
import type {IUserPasswordHistory} from "../../src/interfaces/IUserPasswordHistory";
import type {IUserPasswordHistoryRepository} from "../../src/interfaces/IUserPasswordHistoryRepository";
import UserPasswordHistoryService from "../../src/services/UserPasswordHistoryService";

class InMemoryUserRepository implements IUserRepository {
    private items = new Map<string, IUser>()

    async create(data: IUserCreate): Promise<IUser> {
        const user: IUser = {...data, _id: data._id || "user-1", role: data.role as any, tenant: data.tenant as any} as IUser
        this.items.set(user._id.toString(), user)
        return {...user}
    }

    async update(id: string, data: IUserUpdate): Promise<IUser> {
        const current = this.items.get(id)
        const updated = {...current, ...data, _id: id} as IUser
        this.items.set(id, updated)
        return {...updated}
    }

    async updatePartial(id: string, data: Partial<IUserUpdate & IUser>): Promise<IUser> {
        const current = this.items.get(id)
        const updated = {...current, ...data, _id: id} as IUser
        this.items.set(id, updated)
        return {...updated}
    }

    async delete(id: string): Promise<boolean> {
        return this.items.delete(id)
    }

    async findById(id: string): Promise<IUser | null> {
        const user = this.items.get(id)
        if (!user) {
            return null
        }
        const safeUser = {...user}
        delete safeUser.password
        return safeUser
    }

    async findByIdWithPassword(id: string): Promise<IUser | null> {
        const user = this.items.get(id)
        return user ? {...user} : null
    }

    async findByUsername(username: string): Promise<IUser | null> {
        const user = [...this.items.values()].find((item) => item.username === username)
        if (!user) {
            return null
        }
        const safeUser = {...user}
        delete safeUser.password
        return safeUser
    }

    async findByUsernameWithPassword(username: string): Promise<IUser | null> {
        const user = [...this.items.values()].find((item) => item.username === username)
        return user ? {...user} : null
    }

    async findByEmail(email: string): Promise<IUser | null> {
        const user = [...this.items.values()].find((item) => item.email === email)
        return user ? {...user} : null
    }

    async changePassword(id: string, password: string): Promise<Boolean> {
        const current = this.items.get(id)
        this.items.set(id, {...current, password} as IUser)
        return true
    }

    async changeAvatar(id: string, avatarUrl: string): Promise<Boolean> {
        const current = this.items.get(id)
        this.items.set(id, {...current, avatar: avatarUrl} as IUser)
        return true
    }

    async findByEmailCode(code: string): Promise<IUser | null> {
        const user = [...this.items.values()].find((item) => item.emailCode === code)
        return user ? {...user} : null
    }

    async findByPhoneCode(code: string): Promise<IUser | null> {
        const user = [...this.items.values()].find((item) => item.phoneCode === code)
        return user ? {...user} : null
    }

    async findByRecoveryCode(code: string): Promise<IUser | null> {
        const user = [...this.items.values()].find((item) => item.recoveryCode === code)
        return user ? {...user} : null
    }

    async paginate(): Promise<any> {
        return {items: [...this.items.values()], page: 1, limit: 10, total: this.items.size}
    }

    async search(): Promise<IUser[]> {
        return [...this.items.values()]
    }

    async groupBy(): Promise<any[]> {
        return []
    }

    async export(): Promise<IUser[]> {
        return [...this.items.values()]
    }

    async count(): Promise<number> {
        return this.items.size
    }

    build(): void {
    }
}

class InMemoryUserPasswordHistoryRepository implements IUserPasswordHistoryRepository {
    private items: IUserPasswordHistory[] = []

    async create(data: IUserPasswordHistory): Promise<IUserPasswordHistory> {
        const created = {...data, _id: `${this.items.length + 1}`, createdAt: new Date()}
        this.items.unshift(created)
        return created
    }

    async findLatestByUserId(userId: string, limit: number): Promise<IUserPasswordHistory[]> {
        return this.items.filter((item) => item.user === userId).slice(0, limit)
    }
}

describe("UserServiceTest", function () {
    let userRepository: IUserRepository
    let userService: UserService
    let userAdminData: IUserCreate

    beforeEach(async () => {
        userRepository = new InMemoryUserRepository()
        const userPasswordHistoryService = new UserPasswordHistoryService(new InMemoryUserPasswordHistoryRepository())
        const passwordPolicyResolver = new PasswordPolicyResolver()
        passwordPolicyResolver.setProjectPolicy({requireUppercase: true})
        const passwordPolicyService = new PasswordPolicyService(passwordPolicyResolver, userRepository, userPasswordHistoryService)
        userService = new UserService(userRepository, passwordPolicyService, userPasswordHistoryService)

        userAdminData = {
            _id: "user-1",
            active: true,
            groups: [],
            username: "root",
            email: "root@example.com",
            password: "Root1234",
            name: "root",
            phone: "123456789",
            role: "role-1",
        }

        await userService.create({...userAdminData})
    })

    it("should create user", async function () {
        const userData = {...userAdminData, _id: "user-2", username: "admin2", email: "admin2@example.com"}
        let userCreated = await userService.create(userData)
        expect(userCreated.username).toBe(userData.username)
    })

    it("should find one user", async function () {
        let user = await userService.findById(userAdminData._id)
        expect(user.username).toBe(userAdminData.username)
    })

    it("should modify user", async function () {
        const userData = {...userAdminData}
        const newName = "AdminUpdated"
        userData.name = newName
        let userUpdated = await userService.update(userAdminData._id, userData as any)
        expect(userUpdated.name).toBe(newName)
    })

    it("should fail create user with short password", async function () {
        let userData = {...userAdminData, _id: "user-3", username: "shortpass", email: "shortpass@example.com", password: "123"}

        await expect(async () => {
            await userService.create(userData)
        }).rejects.toSatisfy((err) => {
            expect(err).toBeInstanceOf(ValidationError)
            expect(err.errors[0].field).toBe('password')
            expect(err.errors[0].reason).toBe('validation.password.minLength')
            return true;
        });
    })

    it("create rejects password without uppercase according to policy", async function () {
        let userData = {...userAdminData, _id: "user-4", username: "no-uppercase", email: "nouppercase@example.com", password: "lowercase1"}

        await expect(async () => {
            await userService.create(userData)
        }).rejects.toSatisfy((err) => {
            expect(err).toBeInstanceOf(ValidationError)
            expect(err.errors[0].field).toBe('password')
            expect(err.errors[0].reason).toBe('validation.password.requireUppercase')
            return true;
        });
    })

    it("changeUserPassword rejects password that does not meet policy", async function () {
        const userId = userAdminData._id
        await expect(async () => {
            await userService.changeUserPassword(userId, "lowercase1")
        }).rejects.toSatisfy((err) => {
            expect(err).toBeInstanceOf(ValidationError)
            expect(err.errors[0].field).toBe('newPassword')
            expect(err.errors[0].reason).toBe('validation.password.requireUppercase')
            return true;
        });
    })

    it("changeOwnPassword rejects password that does not meet policy", async function () {
        const userId = userAdminData._id
        await expect(async () => {
            await userService.changeOwnPassword(userId, "Root1234", "sho1A")
        }).rejects.toSatisfy((err) => {
            expect(err).toBeInstanceOf(ValidationError)
            expect(err.errors[0].field).toBe('newPassword')
            expect(err.errors[0].reason).toBe('validation.password.minLength')
            return true;
        });
    })

    it("changeUserPasswordByCode rejects password that does not meet policy", async function () {
        const code = await userService.recoveryCode(userAdminData.email)
        await expect(async () => {
            await userService.changeUserPasswordByCode(code, "lowercase1")
        }).rejects.toSatisfy((err) => {
            expect(err).toBeInstanceOf(ValidationError)
            expect(err.errors[0].field).toBe('newPassword')
            expect(err.errors[0].reason).toBe('validation.password.requireUppercase')
            return true;
        });
    })

    it("preventReuse rejects a recently used password", async function () {
        const userId = userAdminData._id
        await userService.changeUserPassword(userId, "SecondPass1")

        await expect(async () => {
            await userService.changeUserPassword(userId, "Root1234")
        }).rejects.toSatisfy((err) => {
            expect(err).toBeInstanceOf(ValidationError)
            expect(err.errors[0].field).toBe('newPassword')
            expect(err.errors[0].reason).toBe('validation.password.preventReuse')
            return true;
        });
    })

    it("validatePassword returns allowedSpecialChars when required special char is invalid", async function () {
        const resolver = new PasswordPolicyResolver()
        resolver.setProjectPolicy({requireSpecialChar: true, allowedSpecialChars: "%"})
        const passwordPolicyService = new PasswordPolicyService(resolver, userRepository)

        await expect(async () => {
            await passwordPolicyService.validatePassword("Password1ñ")
        }).rejects.toSatisfy((err) => {
            expect(err).toBeInstanceOf(ValidationError)
            expect(err.errors[0].field).toBe('password')
            expect(err.errors[0].reason).toBe('validation.password.requireSpecialChar')
            expect(err.errors[0].allowedSpecialChars).toBe("%")
            return true;
        });
    })
})
