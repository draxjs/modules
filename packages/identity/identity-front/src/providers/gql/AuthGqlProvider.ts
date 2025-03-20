import type {IGqlClient} from '@drax/common-front'
import type {IAuthProvider} from "../../interfaces/IAuthProvider.ts";
import type {IAuthUser} from "../../interfaces/IAuthUser";
import type {ILoginResponse} from "../../interfaces/ILoginResponse";
import type {IUserRegistration} from "../../interfaces/IUserRegistration";

class AuthGqlProvider implements IAuthProvider {

    gqlClient: IGqlClient

    constructor(gqlClient: IGqlClient) {
        this.gqlClient = gqlClient
    }

    setHttpClientToken(token: string): void {
        this.gqlClient.addHeader('Authorization', `Bearer ${token}`)
    }

    removeHttpClientToken(): void {
        this.gqlClient.removeHeader('Authorization')
    }

    logout(): void {
        this.removeHttpClientToken()
    }

    async login(username: string, password: string): Promise<ILoginResponse> {

        const query: string = `mutation auth($input: AuthInput) { auth(input: $input) {accessToken} }`
        const variables = {input: {username, password}}
        let data = await this.gqlClient.mutation(query, variables)
        const {accessToken} = data.auth
        this.setHttpClientToken(accessToken)
        return {accessToken}
    }

    async me(): Promise<IAuthUser> {
        const query: string = `query me { me {id, username, email, phone, role {id, name, permissions}, avatar} }`
        let data = await this.gqlClient.query(query)
        return data.me
    }

    async changeOwnPassword(currentPassword: string, newPassword: string): Promise<boolean> {
        const query: string = `mutation changeOwnPassword($currentPassword: String!, $newPassword: String!) 
        { changeOwnPassword(currentPassword: $currentPassword, newPassword: $newPassword) }`
        const variables = {currentPassword, newPassword}
        let r = await this.gqlClient.mutation(query, variables)
        return /true/i.test(r as string)
    }

    async changeUserPassword(currentPassword: string, newPassword: string): Promise<boolean> {
        const query: string = `mutation changeUserPassword($userId: ID!, $newPassword: String!) 
        { changeUserPassword(userId: $userId, newPassword: $newPassword) }`
        const variables = {currentPassword, newPassword}
        let r = await this.gqlClient.mutation(query, variables)
        return /true/i.test(r as string)
    }

    async changeAvatar(file: Blob): Promise<boolean> {
        //const query: string = `mutation changeAvatar( $file: File!) { changeAvatar }`
        const operations = `{ "query": "mutation ($file: File!) { changeAvatar(file: $file) }", "variables": { "file": null } }`
        const data = new FormData()
        data.append("operations", operations)
        const map = `{"0": ["variables.file"]}`
        data.append("map", map)
        data.append("0", file)
        let r = await this.gqlClient.upload(data)
        return /true/i.test(r as string)
    }

    recoveryPasswordComplete(recoveryCode: string, newPassword: string): Promise<boolean> {
        throw new Error('Not implemented')
    }

    recoveryPasswordRequest(email: string): Promise<boolean> {
        throw new Error('Not implemented')
    }

    register(form: IUserRegistration): Promise<{success: boolean; message: string}> {
        throw new Error('Not implemented')
    }
}

export default AuthGqlProvider
