import type {IEntityCrudHeader} from "./IEntityCrudHeader";
import type {IEntityCrudPermissions} from "./IEntityCrudPermissions";
import type {IEntityCrudField} from "./IEntityCrudField";
import type {IEntityCrudFilter} from "./IEntityCrudFilter";
import type {IEntityCrudForm} from "./IEntityCrudForm";
import type {IEntityCrudRules} from "./IEntityCrudRules";
import type {IEntityCrudRefs} from "./IEntityCrudRefs";
import type {IDraxCrudProvider} from "./IDraxCrudProvider";
import type {IEntityCrudFormFilter} from "./IEntityCrudFormFilter";

interface IEntityCrud {
  name: string

  headers: IEntityCrudHeader[]
  actionHeaders: IEntityCrudHeader[]
  permissions: IEntityCrudPermissions
  fields: IEntityCrudField[]
  createFields: IEntityCrudField[]
  updateFields: IEntityCrudField[]
  deleteFields: IEntityCrudField[]
  viewFields: IEntityCrudField[]
  filters: IEntityCrudFilter[]
  form: IEntityCrudForm
  formFilters: IEntityCrudFormFilter[]
  isViewable: boolean
  isEditable: boolean
  isCreatable: boolean
  isDeletable: boolean
  isExportable: boolean
  isImportable: boolean
  dialogFullscreen: boolean
  exportFormats: string[]
  importFormats: string[]
  exportHeaders: string[]

  refs: IEntityCrudRefs
  getRef(ref: string|undefined): IEntityCrud

  rules: IEntityCrudRules
  getRule(field:string|undefined): Array<Function>|undefined

  provider: IDraxCrudProvider<any, any, any>
}


export type {IEntityCrud}
