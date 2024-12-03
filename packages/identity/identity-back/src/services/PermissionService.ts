const permissions: string[] = []

class PermissionService{

    static addPermission(permission: string){
        if(PermissionService.hasPermission(permission)) return;
        permissions.push(permission)
    }

    static removePermission(permission: string){
        permissions.splice(permissions.indexOf(permission), 1)
    }

    static hasPermission(permission: string): boolean{
        return permissions.includes(permission)
    }

    static getPermissions(): string[]{
        return permissions
    }

}


export default PermissionService
export {PermissionService}
