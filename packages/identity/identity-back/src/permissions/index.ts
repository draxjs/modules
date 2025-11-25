import TenantPermissions from './TenantPermissions.js';
import UserPermissions from './UserPermissions.js';
import RolePermissions from './RolePermissions.js';
import UserApiKeyPermissions from './UserApiKeyPermissions.js';
import UserLoginFailPermissions from './UserLoginFailPermissions.js';
import UserSessionPermissions from './UserSessionPermissions.js';

const permissions = {
    ...TenantPermissions,
    ...UserPermissions,
    ...RolePermissions,
    ...UserApiKeyPermissions,
    ...UserLoginFailPermissions,
    ...UserSessionPermissions
};


export default permissions;
export {permissions};
