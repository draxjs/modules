
class PermissionService{

    protected static permissions: string[] = []

    static addPermission(permission: string){
        if(PermissionService.hasPermission(permission)) return;
        PermissionService.permissions.push(permission)
    }

    static removePermission(permission: string){
        PermissionService.permissions.splice(PermissionService.permissions.indexOf(permission), 1)
    }

    static hasPermission(permission: string): boolean{
        return PermissionService.permissions.includes(permission)
    }

    static getPermissions(): string[]{
        return PermissionService.permissions
    }

}


export default PermissionService
export {PermissionService}
