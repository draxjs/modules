import UserService from "../../src/services/UserService";
import {IUser} from "../../../identity-share/src/interfaces/IUser";
import UserMongoRepository from "../../src/repository/mongo/UserMongoRepository";

class UserMongoInitializer {

    static async initRootUser(): Promise<IUser>{
        const userService = new UserService(new UserMongoRepository())
        let data = (await import("../data-obj/users/root-mongo-user")).default
        let userCreated = await userService.create(data)
        return userCreated
    }
}

export default UserMongoInitializer
export {
    UserMongoInitializer
}
