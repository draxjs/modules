import RoleServiceFactory from "../factory/RoleServiceFactory.js"
import UserServiceFactory from "../factory/UserServiceFactory.js"
import {IUserCreate} from "../interfaces/IUser";

async function CreateUserIfNotExist(userData: IUserCreate) {
    const userService = UserServiceFactory()
    const roleService = RoleServiceFactory()
    const user = await userService.findByUsername(userData.username)
    if (user) {
    } else {
        const role = await roleService.findByName(userData.role as string)
        userData.role = role.id as string
        const r = await userService.create(userData)
        console.log("User Created. Username: " + userData.username)
    }
}

export default CreateUserIfNotExist
export {
    CreateUserIfNotExist
}
