import Crud from "./components/Crud.vue";
import CrudDialog from "./components/CrudDialog.vue";
import CrudForm from "./components/CrudForm.vue";
import CrudFormField from "./components/CrudFormField.vue";
import CrudFormList from "./components/CrudFormList.vue";
import CrudList from "./components/CrudList.vue";
import CrudNotify from "./components/CrudNotify.vue";
import CrudSearch from "./components/CrudSearch.vue";
import {useCrudStore} from "./stores/UseCrudStore";
import {useCrud} from "./composables/UseCrud";
import {EntityCrud} from "./EntityCrud";

import type {IFields, ICrudForm, ICrudHeaders, ICrudPermissions, ICrudRules} from "./interfaces/IEntityCrud";
export type {IFields, ICrudForm, ICrudHeaders, ICrudPermissions, ICrudRules}

export {
    Crud,
    CrudDialog,
    CrudForm,
    CrudFormField,
    CrudFormList,
    CrudList,
    CrudNotify,
    CrudSearch,
    useCrud,
    useCrudStore,
    EntityCrud

}
