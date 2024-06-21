import {UserServiceFactory} from "@drax/identity-back"

async function RecoveryUserPassword(username:string, password:string) {
    const userService = UserServiceFactory
    const user = await userService.findByUsername(username)
    const r = await userService.changeUserPassword(user.id as string, password)
    console.log("recoveryUserPassword",r)
}

export default RecoveryUserPassword
export {
    RecoveryUserPassword
}
