import TenantPermissions from './TenantPermissions';
import UserPermissions from './UserPermissions';
import RolePermissions from './RolePermissions';
import UserApiKeyPermissions from './UserApiKeyPermissions';

const permissions = {
    ...TenantPermissions,
    ...UserPermissions,
    ...RolePermissions,
    ...UserApiKeyPermissions
};


export default permissions;
export {permissions};
