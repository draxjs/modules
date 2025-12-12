
import UserSessionRepository from '../../repository/UserSessionRepository.js'
import {UserSessionService} from '../../services/UserSessionService.js'
import {UserSessionBaseSchema} from "../../schemas/UserSessionSchema.js";

class UserSessionServiceFactory {
    private static service: UserSessionService;

    public static get instance(): UserSessionService {
        if (!UserSessionServiceFactory.service) {
            const repository = new UserSessionRepository();
            const schema = UserSessionBaseSchema;
            UserSessionServiceFactory.service = new UserSessionService(repository, schema);
        }
        return UserSessionServiceFactory.service;
    }
}

export default UserSessionServiceFactory
export {
    UserSessionServiceFactory
}

