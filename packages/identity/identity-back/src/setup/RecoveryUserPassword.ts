import UserServiceFactory from "../factory/UserServiceFactory.js"

async function RecoveryUserPassword(username:string, password:string) {
    const userService = UserServiceFactory()
    const user = await userService.findByUsername(username)
    const r = await userService.changeUserPassword(user.id as string, password)
    console.log("User password recovered. Username: " + username)
}

export default RecoveryUserPassword
export {
    RecoveryUserPassword
}
