import AuthSystem from "@/core/system/AuthSystem";
import type {IAuthProvider} from "@/core/interfaces/IAuthProvider";
import AuthRestProviderFactory from "@/core/factories/providers/AuthProviderFactory";

class AuthSystemFactory {

    static create(type: string = 'rest'): AuthSystem {
        const provider: IAuthProvider = AuthRestProviderFactory.create(type)

        return new AuthSystem(provider)
    }
}
