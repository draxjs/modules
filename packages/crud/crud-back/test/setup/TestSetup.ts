import Fastify, { FastifyInstance, FastifyPluginAsync } from "fastify";
import { LoadCommonConfigFromEnv } from "@drax/common-back";
import {
    LoadIdentityConfigFromEnv,
    CreateTenantIfNotExist,
    CreateOrUpdateRole,
    CreateUserIfNotExist,
    jwtMiddleware,
    rbacMiddleware,
    apiKeyMiddleware,
    UserRoutes, RoleRoutes, TenantRoutes, UserApiKeyRoutes,
    UserPermissions, RolePermissions, TenantPermissions, UserApiKeyPermissions,
    LoadPermissions
} from "@drax/identity-back";

import {LanguageModel, LanguageSchema} from "../people/models/LanguageModel.js"
import {CountryModel, CountrySchema} from "../people/models/CountryModel.js"
import {PersonModel, PersonSchema} from "../people/models/PersonModel.js"



import adminRoleData from "./data/admin-role";
import restrictedRoleData from "./data/restricted-role";

import rootUserData from "./data/root-user";
import basicUserData from "./data/basic-user";

import { IUser, IRole, ITenant } from "@drax/identity-share";
import MongoInMemory from "./MongoInMemory";

import oneTenant from "./data/one-tenant";
import twoTenant from "./data/two-tenant";
import tenantOneUser from "./data/tenant-one-user";
import tenantTwoUser from "./data/tenant-two-user";

interface ITestSetupInput {
    routes?: FastifyPluginAsync[]
    permissions?: object[]
}

class TestSetup {

    private _fastifyInstance: FastifyInstance;
    private _mongoInMemory: MongoInMemory;
    private _rootUser: IUser;
    private _basicUser: IUser;
    private _adminRole: IRole;
    private _restrictedRole: IRole;
    private _customRoutes: FastifyPluginAsync[] = [];
    private _customPermissions: object[] = [];

    private _tenantOne: ITenant;
    private _tenantTwo: ITenant;
    private _tenantOneUser: IUser;
    private _tenantTwoUser: IUser;

    constructor(input?: ITestSetupInput) {
        this._customRoutes = input?.routes ?? [];
        this._customPermissions = input?.permissions ?? [];
    }

    async setup() {
        this.setupEnvironmentVariables();
        this.setupConfig();
        this.setupPermissions();
        this.setupFastifyInstance();
        await this.setupMongoInMemoryAndConnect();
        await this.setupRootUserAndAdminRole();
        await this.setupBasicUserAndRestrictedRole();
        await this.setupTenantOneAndTenantOneUser();
        await this.setupTenantTwoAndTenantTwoUser();
    }

    setupEnvironmentVariables() {
        // Define environment variables
        process.env.DRAX_DB_ENGINE = "mongo";
        process.env.DRAX_JWT_SECRET = "xxx";
    }

    setupConfig() {
        LoadCommonConfigFromEnv();
        LoadIdentityConfigFromEnv();
    }

    setupPermissions() {
        //Merge All Permissions
        const permissions = [
            ...Object.values(UserPermissions),
            ...Object.values(RolePermissions),
            ...Object.values(TenantPermissions),
            ...Object.values(UserApiKeyPermissions),
            ...this.getCustomPermissions()
        ]

        //Load All Permissions
        LoadPermissions(permissions)
    }

    getCustomPermissions() {
        const customPermissions = []
        for (const permission of this._customPermissions) {
            customPermissions.push(...Object.values(permission))
        }
        return customPermissions
    }

    setupFastifyInstance() {
        this._fastifyInstance = Fastify()
        this._fastifyInstance.setErrorHandler(function (error: any, request, reply) {
            console.error("TEST FASTIFY ERROR CAUGHT:", error);
            reply.status(500).send({ statusCode: 500, error: "InternalServerError", message: error?.message });
        });
        this._fastifyInstance.setValidatorCompiler(() => () => true)
        this._fastifyInstance.addHook('onRequest', jwtMiddleware)
        this._fastifyInstance.addHook('onRequest', rbacMiddleware)
        this._fastifyInstance.addHook('onRequest', apiKeyMiddleware)
        this._fastifyInstance.register(UserRoutes)
        this._fastifyInstance.register(RoleRoutes)
        this._fastifyInstance.register(TenantRoutes)
        this._fastifyInstance.register(UserApiKeyRoutes)
        this.registerRoutes(this._customRoutes)
    }

    registerRoutes(routes: FastifyPluginAsync[]) {
        for (const route of routes) {
            this._fastifyInstance.register(route)
        }
    }

    async setupMongoInMemoryAndConnect() {
        this._mongoInMemory = new MongoInMemory();
        await this._mongoInMemory.connect();
    }

    async setupTenantOneAndTenantOneUser() {
        this._tenantOne = await CreateTenantIfNotExist(oneTenant)
        this._tenantOneUser = await CreateUserIfNotExist({ ...tenantOneUser })
    }

    async setupTenantTwoAndTenantTwoUser() {
        this._tenantTwo = await CreateTenantIfNotExist(twoTenant)
        this._tenantTwoUser = await CreateUserIfNotExist({ ...tenantTwoUser })
    }

    async setupRootUserAndAdminRole() {
        this._adminRole = await CreateOrUpdateRole({ ...adminRoleData })
        this._rootUser = await CreateUserIfNotExist({ ...rootUserData })
    }

    async setupBasicUserAndRestrictedRole() {
        this._restrictedRole = await CreateOrUpdateRole({ ...restrictedRoleData })
        this._basicUser = await CreateUserIfNotExist({ ...basicUserData })
    }

    addRoutes(routes) {
        this._fastifyInstance.register(routes)
    }

    addPermissions(permissions: object) {
        LoadPermissions([...Object.values(permissions)])
    }

    async dropCollections() {
        await this._mongoInMemory.dropCollections()
    }

    async dropCollection(collectionName: string) {
        await this._mongoInMemory.dropCollection(collectionName)
    }

    async dropAndClose() {
        await this._mongoInMemory.dropAndClose()
    }

    async login(username: string, password: string): Promise<{ accessToken: string }> {

        const resp = await this._fastifyInstance.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: { username: username, password: password }
        });

        let body = resp.json()

        if (resp.statusCode === 200 && body.accessToken) {
            return { accessToken: body.accessToken }
        } else {
            throw new Error(`Failed to login. Status Code:  ${resp.statusCode} body:  ${resp.body}`)
        }

    }

    async rootUserLogin(): Promise<{ accessToken: string }> {

        const resp = await this._fastifyInstance.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: {
                username: rootUserData.username,
                password: rootUserData.password
            }
        });

        let body = resp.json()

        if (resp.statusCode === 200 && body.accessToken) {
            return { accessToken: body.accessToken }
        } else {
            throw new Error(`Failed to login. Status Code:  ${resp.statusCode} body:  ${resp.body}`)
        }
    }

    async basicUserLogin(): Promise<{ accessToken: string }> {

        const resp = await this._fastifyInstance.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: {
                username: basicUserData.username,
                password: basicUserData.password
            }
        });

        let body = resp.json()

        if (resp.statusCode === 200 && body.accessToken) {
            return { accessToken: body.accessToken }
        } else {
            throw new Error(`Failed to login. Status Code:  ${resp.statusCode} body:  ${resp.body}`)
        }
    }

    async tenantOneUserLogin(): Promise<{ accessToken: string }> {
        const resp = await this._fastifyInstance.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: {
                username: tenantOneUser.username,
                password: tenantOneUser.password
            }
        });

        let body = resp.json()

        if (resp.statusCode === 200 && body.accessToken) {
            return { accessToken: body.accessToken }
        } else {
            throw new Error(`Failed to login. Status Code:  ${resp.statusCode} body:  ${resp.body}`)
        }
    }

    async tenantTwoUserLogin(): Promise<{ accessToken: string }> {
        const resp = await this._fastifyInstance.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: {
                username: tenantTwoUser.username,
                password: tenantTwoUser.password
            }
        });

        let body = resp.json()

        if (resp.statusCode === 200 && body.accessToken) {
            return { accessToken: body.accessToken }
        } else {
            throw new Error(`Failed to login. Status Code:  ${resp.statusCode} body:  ${resp.body}`)
        }
    }

    async me(accessToken: string): Promise<IUser> {

        const resp = await this._fastifyInstance.inject({
            method: 'GET',
            url: '/api/auth/me',
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (resp.statusCode === 200) {
            let user: IUser = resp.json() as IUser
            return user
        } else {
            throw new Error(`Failed to get me. Status Code:  ${resp.statusCode} body:  ${resp.body}`)
        }


    }


    get adminRoleData() {
        return { ...adminRoleData };
    }

    get restrictedRoleData() {
        return { ...restrictedRoleData };
    }

    get rootUserData() {
        return { ...rootUserData };
    }

    get basicUserData() {
        return { ...basicUserData };
    }

    get tenantOneUserData() {
        return { ...tenantOneUser };
    }

    get tenantTwoUserData() {
        return { ...tenantTwoUser };
    }

    get adminRole() {
        return this._adminRole;
    }

    get restrictedRole() {
        return this._restrictedRole;
    }

    get rootUser() {
        return this._rootUser;
    }

    get basicUser() {
        return this._basicUser;
    }

    get fastifyInstance() {
        return this._fastifyInstance;
    }

    get mongoInMemory() {
        return this._mongoInMemory;
    }


}


export default TestSetup

export {
    TestSetup
}
