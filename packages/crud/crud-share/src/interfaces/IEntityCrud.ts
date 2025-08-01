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
  dialogMaxWidth?: string
  dialogZindex?: number
  exportFormats: string[]
  importFormats: string[]
  exportHeaders: string[]

  containerFluid?: boolean

  cardClass?: string
  cardDensity?: 'default' | 'comfortable' | 'compact'

  toolbarClass?: string
  toolbarDensity?: 'default' | 'comfortable' | 'compact'

  tableDensity?: 'default' | 'comfortable' | 'compact'
  tableStriped?: null | 'odd' | 'even'

  headerProps?: Record<string, any>;

  footerClass?: string

  searchEnable?: boolean

  filterButtons?: boolean

  tabs?: string[]
  menus?: string[]
  menuMaxHeight?: string

  refs: IEntityCrudRefs
  getRef(ref: string|undefined): IEntityCrud

  rules: IEntityCrudRules
  getRule(field:string|undefined): Array<Function>|undefined

  provider: IDraxCrudProvider<any, any, any>
}


export type {IEntityCrud}
