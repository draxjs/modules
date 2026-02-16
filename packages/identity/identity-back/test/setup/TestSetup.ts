import Fastify, {FastifyInstance} from "fastify";
import {LoadCommonConfigFromEnv} from "@drax/common-back";
import {
    LoadIdentityConfigFromEnv,
    CreateOrUpdateRole,
    CreateUserIfNotExist,
    jwtMiddleware,
    rbacMiddleware,
    apiKeyMiddleware,
    UserRoutes, RoleRoutes, TenantRoutes, UserApiKeyRoutes,
    UserPermissions, RolePermissions, TenantPermissions, UserApiKeyPermissions,
    LoadPermissions
} from "@drax/identity-back";

import adminRoleData from "./data/admin-role";
import restrictedRoleData from "./data/restricted-role";

import rootUserData from "./data/root-user";
import basicUserData from "./data/basic-user";

import {IUser, IRole} from "@drax/identity-share";
import MongoInMemory from "./MongoInMemory";

class TestSetup {

    private _fastifyInstance: FastifyInstance;
    private _mongoInMemory: MongoInMemory;
    private _rootUser: IUser;
    private _basicUser: IUser;
    private _adminRole: IRole;
    private _restrictedRole: IRole;

    constructor() {
    }

    async setup() {
        this.setupEnvironmentVariables();
        this.setupConfig();
        this.setupPermissions();
        this.setupFastifyInstance();
        await this.setupMongoInMemoryAndConnect();
        await this.setupRootUserAndAdminRole();
        await this.setupBasicUserAndRestrictedRole();
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
        ]

        //Load All Permissions
        LoadPermissions(permissions)
    }

    setupFastifyInstance() {
        this._fastifyInstance = Fastify()
        this._fastifyInstance.setValidatorCompiler(() => () => true)
        this._fastifyInstance.addHook('onRequest', jwtMiddleware)
        this._fastifyInstance.addHook('onRequest', rbacMiddleware)
        this._fastifyInstance.addHook('onRequest', apiKeyMiddleware)
        this._fastifyInstance.register(UserRoutes)
        this._fastifyInstance.register(RoleRoutes)
        this._fastifyInstance.register(TenantRoutes)
        this._fastifyInstance.register(UserApiKeyRoutes)
    }

    async setupMongoInMemoryAndConnect() {
        this._mongoInMemory = new MongoInMemory();
        await this._mongoInMemory.connect();
    }

    async setupRootUserAndAdminRole() {
        this._adminRole = await CreateOrUpdateRole({...adminRoleData})
        this._rootUser = await CreateUserIfNotExist({...rootUserData})
    }

    async setupBasicUserAndRestrictedRole() {
        this._restrictedRole = await CreateOrUpdateRole({...restrictedRoleData})
        this._basicUser = await CreateUserIfNotExist({...basicUserData})
    }

    async dropData() {
        await this._mongoInMemory.dropData()
    }

    async dropAndClose() {
        await this._mongoInMemory.dropAndClose()
    }

    async login(username: string, password: string): Promise<{accessToken: string}> {

        const resp = await this._fastifyInstance.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: {username: username, password: password}
        });

        let body = resp.json()

        if(resp.statusCode === 200 && body.accessToken){
            return {accessToken: body.accessToken}
        }else{
            throw new Error(`Failed to login. Status Code:  ${resp.statusCode} body:  ${resp.body}`)
        }

    }

    async rootUserLogin(): Promise<{accessToken: string}> {

        const resp = await this._fastifyInstance.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: {
                username: rootUserData.username,
                password: rootUserData.password
            }
        });

        let body = resp.json()

        if(resp.statusCode === 200 && body.accessToken){
            return {accessToken: body.accessToken}
        }else{
            throw new Error(`Failed to login. Status Code:  ${resp.statusCode} body:  ${resp.body}`)
        }
    }

    async basicUserLogin(): Promise<{accessToken: string}> {

        const resp = await this._fastifyInstance.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: {
                username: basicUserData.username,
                password: basicUserData.password
            }
        });

        let body = resp.json()

        if(resp.statusCode === 200 && body.accessToken){
            return {accessToken: body.accessToken}
        }else{
            throw new Error(`Failed to login. Status Code:  ${resp.statusCode} body:  ${resp.body}`)
        }
    }

    async me(accessToken:string): Promise<IUser> {

        const resp = await this._fastifyInstance.inject({
            method: 'GET',
            url: '/api/auth/me',
            headers: {Authorization: `Bearer ${accessToken}`}
        });

        if(resp.statusCode === 200){
            let user : IUser = resp.json() as IUser
            return user
        }else{
            throw new Error(`Failed to get me. Status Code:  ${resp.statusCode} body:  ${resp.body}`)
        }


    }


    get adminRoleData() {
        return {...adminRoleData};
    }

    get restrictedRoleData() {
        return {...restrictedRoleData};
    }

    get rootUserData() {
        return {...rootUserData};
    }

    get basicUserData() {
        return {...basicUserData};
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
