import type {IPasswordPolicyProject} from "@drax/identity-share";
import PasswordPolicyResolverFactory from "../factory/PasswordPolicyResolverFactory.js";


function SetProjectPasswordPolicy(projectPasswordPolicy: IPasswordPolicyProject){

    const passwordPolicyResolver = PasswordPolicyResolverFactory()
    passwordPolicyResolver.setProjectPolicy(projectPasswordPolicy)
}

export default SetProjectPasswordPolicy
export {SetProjectPasswordPolicy}
