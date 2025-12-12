
import UserLoginFailRepository from '../../repository/UserLoginFailRepository.js'
import {UserLoginFailService} from '../../services/UserLoginFailService.js'
import {UserLoginFailBaseSchema} from "../../schemas/UserLoginFailSchema.js";

class UserLoginFailServiceFactory {
    private static service: UserLoginFailService;

    public static get instance(): UserLoginFailService {
        if (!UserLoginFailServiceFactory.service) {
            const repository = new UserLoginFailRepository();
            const schema = UserLoginFailBaseSchema;
            UserLoginFailServiceFactory.service = new UserLoginFailService(repository, schema);
        }
        return UserLoginFailServiceFactory.service;
    }
}

export default UserLoginFailServiceFactory
export {
    UserLoginFailServiceFactory
}

