import RoleServiceFactory from "../factory/RoleServiceFactory.js"
import UserServiceFactory from "../factory/UserServiceFactory.js"
import {IUserCreate, IUser} from "@drax/identity-share";

async function CreateUserIfNotExist(userData: IUserCreate): Promise<IUser> {
    const userService = UserServiceFactory()
    const roleService = RoleServiceFactory()
    const user = await userService.findByUsername(userData.username)
    if (user) {
        return user
    } else {
        const role = await roleService.findByName(userData.role as string)
        userData.role = role._id.toString()
        const r = await userService.create(userData)
        console.log("User Created. Username: " + userData.username)
        return r
    }
}

export default CreateUserIfNotExist
export {
    CreateUserIfNotExist
}
