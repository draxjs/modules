import {LoadPermissions} from "@drax/identity-back";
import {IdentityPermissions} from "@drax/identity-back";
import {MediaPermissions} from "@drax/media-back";
import {PersonPermissions} from "../modules/people/permissions/PersonPermissions.js";
import {CountryPermissions} from "../modules/people/permissions/CountryPermissions.js";
import {LanguagePermissions} from "../modules/people/permissions/LanguagePermissions.js";


function InitializePermissions() {

    //Load Identity Permissions
    const identityPermissions = Object.values(IdentityPermissions)
    const mediaPermissions = Object.values(MediaPermissions)
    const personPermissions = Object.values(PersonPermissions)
    const countryPermissions = Object.values(CountryPermissions)
    const languagePermissions = Object.values(LanguagePermissions)

    //Merge All Permissions
    const permissions = [
        ...identityPermissions,
        ...mediaPermissions,
        ...personPermissions,
        ...countryPermissions,
        ...languagePermissions
    ]

    //Load All Permissions
    LoadPermissions(permissions)
}

export default InitializePermissions

export {InitializePermissions}

