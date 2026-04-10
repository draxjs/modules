import type {IPasswordPolicy, IPasswordPolicyProject} from "@drax/identity-share";
import {defaultPasswordPolicy} from "../policies/defaultPasswordPolicy.js";
import {PartialPasswordPolicySchema, PasswordPolicySchema} from "../schemas/PasswordPolicySchema.js";
import getPasswordEnvPolicy from "../utils/getPasswordEnvPolicy.js";

class PasswordPolicyResolver {

    private projectPolicy : IPasswordPolicyProject = {};

    setProjectPolicy (projectPolicy : IPasswordPolicyProject){
        this.projectPolicy = projectPolicy;
    }

    async resolve(): Promise<IPasswordPolicy> {
        const projectPolicy = await this.getProjectPolicy()
        const envPolicy = getPasswordEnvPolicy()

        return PasswordPolicySchema.parse({
            ...defaultPasswordPolicy,
            ...projectPolicy,
            ...envPolicy
        }) as IPasswordPolicy
    }

    private async getProjectPolicy(): Promise<Partial<IPasswordPolicy>> {
        return this.projectPolicy
            ? PartialPasswordPolicySchema.parse(this.projectPolicy)
            : {}
    }
}

export default PasswordPolicyResolver
export {PasswordPolicyResolver}
