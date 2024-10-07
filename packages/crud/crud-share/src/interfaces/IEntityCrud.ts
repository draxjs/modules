import type {IEntityCrudHeader} from "./IEntityCrudHeader";
import type {IEntityCrudPermissions} from "./IEntityCrudPermissions";
import type {IEntityCrudField} from "./IEntityCrudField";
import type {IEntityCrudForm} from "./IEntityCrudForm";
import type {IEntityCrudRules} from "./IEntityCrudRules";
import type {IEntityCrudRefs} from "./IEntityCrudRefs";
import type {IDraxCrudProvider} from "./IDraxCrudProvider";

interface IEntityCrud {
  name: string

  headers: IEntityCrudHeader[]
  permissions: IEntityCrudPermissions
  fields: IEntityCrudField[]
  form: IEntityCrudForm
  rules: IEntityCrudRules
  rule: (field:string|undefined) => Array<Function>
  isEditable: boolean
  isCreatable: boolean
  isDeletable: boolean
  isExportable: boolean
  isImportable: boolean
  dialogFullscreen: boolean
  exportFormats: string[]
  importFormats: string[]
  exportHeaders: string[]
  getRef(ref: string|undefined): IEntityCrud
  refs: IEntityCrudRefs
  provider: IDraxCrudProvider<any, any, any>
}


export type {IEntityCrud}
