import {LoadPermissions} from "@drax/identity-back";
import {
    UserPermissions,
    RolePermissions,
    TenantPermissions,
    UserApiKeyPermissions,
    UserSessionPermissions,
    UserLoginFailPermissions
} from "@drax/identity-back";
import {MediaPermissions} from "@drax/media-back";
import {DynamicFormPermissions} from "@drax/dynamic-back";
import {DashboardPermissions} from "@drax/dashboard-back";
import {SettingPermissions} from "@drax/settings-back";
import {PersonPermissions} from "../modules/people/permissions/PersonPermissions.js";
import {CountryPermissions} from "../modules/people/permissions/CountryPermissions.js";
import {LanguagePermissions} from "../modules/people/permissions/LanguagePermissions.js";


function InitializePermissions() {


    //Merge All Permissions
    const permissions = [
        ...Object.values(UserPermissions),
        ...Object.values(RolePermissions),
        ...Object.values(TenantPermissions),
        ...Object.values(UserApiKeyPermissions),
        ...Object.values(UserSessionPermissions),
        ...Object.values(UserLoginFailPermissions),
        ...Object.values(MediaPermissions),
        ...Object.values(SettingPermissions),
        ...Object.values(PersonPermissions),
        ...Object.values(CountryPermissions),
        ...Object.values(LanguagePermissions),
        ...Object.values(DynamicFormPermissions),
        ...Object.values(DashboardPermissions),
    ]

    //Load All Permissions
    LoadPermissions(permissions)
}

export default InitializePermissions

export {InitializePermissions}

