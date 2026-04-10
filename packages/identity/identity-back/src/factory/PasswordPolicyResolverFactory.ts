import PasswordPolicyResolver from "../resolver/PasswordPolicyResolver.js";

let passwordPolicyResolver: PasswordPolicyResolver

const PasswordPolicyResolverFactory = (): PasswordPolicyResolver => {
    if (!passwordPolicyResolver) {

        passwordPolicyResolver = new PasswordPolicyResolver()
    }

    return passwordPolicyResolver
}

export default PasswordPolicyResolverFactory
