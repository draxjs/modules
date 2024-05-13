import AuthSystem from "@/core/system/AuthSystem";
import type {IAuthProviderInterface} from "@/core/interfaces/IAuthProviderInterface";
import AuthRestProviderFactory from "@/core/factories/providers/AuthProviderFactory";

class AuthSystemFactory {

    static create(type: string = 'rest'): AuthSystem {
        const provider: IAuthProviderInterface = AuthRestProviderFactory.create(type)

        return new AuthSystem(provider)
    }
}
