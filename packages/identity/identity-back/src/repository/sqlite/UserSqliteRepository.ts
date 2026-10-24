import {IUser, IUserCreate, IUserUpdate} from "@drax/identity-share";
import {IUserRepository, IEmailVerificationClaim} from "../../interfaces/IUserRepository";
import {

    ValidationError
} from "@drax/common-back";
import type {SqliteTableField} from "@drax/common-back";
import RoleSqliteRepository from "./RoleSqliteRepository.js";
import TenantSqliteRepository from "./TenantSqliteRepository.js";
import {AbstractSqliteRepository} from "@drax/crud-back";
import {hideUserSecrets} from '../../utils/UserSecrets.js';

class UserSqliteRepository extends AbstractSqliteRepository<IUser, IUserCreate, IUserUpdate> implements IUserRepository {
    private roleRepository: RoleSqliteRepository;
    private tenantRepository: TenantSqliteRepository;

    protected db: any;
    protected tableName: string = 'users';
    protected dataBaseFile: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = ['active', 'emailVerified', 'phoneVerified'];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        {field: 'tenant', table: 'tenants', identifier: '_id'},
        // {field: 'role', table: 'roles', identifier: '_id'}
    ]
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: false, primary: false},
        {name: "username", type: "TEXT", unique: true, primary: false},
        {name: "active", type: "INTEGER", unique: false, primary: false},
        {name: "password", type: "TEXT", unique: false, primary: false},
        {name: "email", type: "TEXT", unique: true, primary: false},
        {name: "phone", type: "TEXT", unique: false, primary: false},
        {name: "role", type: "TEXT", unique: false, primary: false},
        {name: "tenant", type: "TEXT", unique: false, primary: false},
        {name: "groups", type: "TEXT", unique: false, primary: false},
        {name: "avatar", type: "TEXT", unique: false, primary: false},
        {name: "origin", type: "TEXT", unique: false, primary: false},
        {name: "createdAt", type: "TEXT", unique: false, primary: false},
        {name: "updatedAt", type: "TEXT", unique: false, primary: false},
        {name: "emailVerified", type: "INTEGER", unique: false, primary: false},
        {name: "phoneVerified", type: "INTEGER", unique: false, primary: false},
        {name: "emailCode", type: "TEXT", unique: false, primary: false},
        {name: "emailCodeExpiresAt", type: "INTEGER", unique: false, primary: false},
        {name: "emailVerificationLastAttemptAt", type: "INTEGER", unique: false, primary: false},
        {name: "phoneCode", type: "TEXT", unique: false, primary: false},
    ]
    protected verbose: boolean;

    constructor(dataBaseFile: string, verbose: boolean = false) {
        // Expanded SQL tracing would expose passwords and activation codes.
        super(dataBaseFile, false);
        this.roleRepository = new RoleSqliteRepository(dataBaseFile, verbose);
        this.tenantRepository = new TenantSqliteRepository(dataBaseFile, verbose);
    }


    async prepareData(userData: any) {
        if (userData.groups && Array.isArray(userData.groups)) {
            userData.groups = userData.groups.join(",")
        }

        if (userData.role && typeof userData.role === 'object' && userData.role._id) {
            userData.role = userData.role._id
        }

        if (userData.tenant && typeof userData.tenant === 'object' && userData.tenant._id) {
            userData.tenant = userData.tenant._id
        }

        userData.active = userData.active ? 1 : 0

        if (!await this.findRoleById(userData.role)) {
            throw new ValidationError([{field: 'role', reason: 'validation.notfound', value: userData.role}])
        }
    }

    async prepareItem(user: any) {
        if (!user) return
        hideUserSecrets(user)
        if (user && user.role && typeof user.role === 'string') {
            user.role = await this.findRoleById(user.role)
        }

        if (user && user.tenant && typeof user.tenant === 'string') {
            user.tenant = await this.findTenantById(user.tenant)
        }

        if (user && user.hasOwnProperty('groups')) {
            user.groups = user.groups ? user.groups.split(",") : []
        }
    }


    async updatePartial(id: string, userData: IUserUpdate): Promise<IUser> {
        return this.update(id, userData)
    }


    async findByUsername(username: string): Promise<IUser> {
        const user = this.db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (!user) {
            return null
        }
        await this.decorate(user)
        return user
    }

    async findByUsernameWithPassword(username: string): Promise<IUser> {
        const user = this.db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (!user) {
            return null
        }
        const password = user.password
        await this.decorate(user)
        user.password = password
        return user
    }

    async findByIdWithPassword(id: string): Promise<IUser | null> {
        const user = this.db.prepare(`SELECT * FROM users WHERE ${this.identifier} = ?`).get(id);
        if (!user) {
            return null
        }
        const password = user.password
        await this.decorate(user)
        user.password = password
        return user
    }

    async findByEmail(email: string): Promise<IUser> {
        const user = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return null
        }
        await this.decorate(user)
        return user
    }

    async claimEmailVerification(claim: IEmailVerificationClaim): Promise<{email: string, emailCode: string} | null> {
        // Both CASE expressions observe the old row, so code and expiry always rotate together.
        return this.db.prepare(`UPDATE users SET
            emailCode = CASE WHEN emailCode IS NOT NULL AND emailCode != '' AND emailCodeExpiresAt > @now
                THEN emailCode ELSE @code END,
            emailCodeExpiresAt = CASE WHEN emailCode IS NOT NULL AND emailCode != '' AND emailCodeExpiresAt > @now
                THEN emailCodeExpiresAt ELSE @expiresAt END,
            emailVerificationLastAttemptAt = @now
            WHERE email = @email AND origin = 'Registry' AND emailVerified = 0
                AND (emailVerificationLastAttemptAt IS NULL OR emailVerificationLastAttemptAt <= @cooldownBefore)
            RETURNING email, emailCode`).get(claim) ?? null;
    }

    async consumeEmailVerification(code: string, now: number): Promise<boolean> {
        return this.db.prepare(`UPDATE users SET emailVerified = 1, active = 1,
            emailCode = NULL, emailCodeExpiresAt = NULL
            WHERE emailCode = ? AND origin = 'Registry' AND emailVerified = 0 AND emailCodeExpiresAt > ?`)
            .run(code, now).changes === 1;
    }

    async findByEmailCode(code: string): Promise<IUser> {
        const user = this.db.prepare('SELECT * FROM users WHERE emailCode = ? AND emailVerified = 0').get(code);
        if (!user) {
            return null
        }
        await this.decorate(user)
        return user
    }

    async findByRecoveryCode(code: string): Promise<IUser> {
        const user = this.db.prepare('SELECT * FROM users WHERE recoveryCode = ? AND active = 1').get(code);
        if (!user) {
            return null
        }
        await this.decorate(user)
        return user
    }

    async findByPhoneCode(code: string): Promise<IUser> {
        const user = this.db.prepare('SELECT * FROM users WHERE phoneCode = ? AND phoneVerified = 0').get(code);
        if (!user) {
            return null
        }
        await this.decorate(user)
        return user
    }


    async findRoleById(id: string) {
        return await this.roleRepository.findById(id)
    }

    async findTenantById(id: string) {
        return await this.tenantRepository.findById(id)
    }

    async changePassword(id: string, password: string): Promise<boolean> {
        const stmt = this.db.prepare(`UPDATE users
                                      SET password = @password
                                      WHERE ${this.identifier} = @id `);
        stmt.run({id: id, password: password});
        return true
    }

    async changeAvatar(id: string, avatar: string): Promise<boolean> {
        const stmt = this.db.prepare(`UPDATE users
                                      SET avatar = @avatar
                                      WHERE ${this.identifier} = @id `);
        stmt.run({id: id, avatar: avatar});
        return true
    }


}

export default UserSqliteRepository
