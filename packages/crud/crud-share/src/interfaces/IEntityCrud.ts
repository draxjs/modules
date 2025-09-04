import type {IEntityCrudHeader} from "./IEntityCrudHeader";
import type {IEntityCrudPermissions} from "./IEntityCrudPermissions";
import type {IEntityCrudField} from "./IEntityCrudField";
import type {IEntityCrudFilter} from "./IEntityCrudFilter";
import type {IEntityCrudForm} from "./IEntityCrudForm";
import type {IEntityCrudRules} from "./IEntityCrudRules";
import type {IEntityCrudRefs} from "./IEntityCrudRefs";
import type {IDraxCrudProvider} from "./IDraxCrudProvider";
import type {IEntityCrudFormFilter} from "./IEntityCrudFormFilter";
import type {IEntityCrudFieldVariant} from "./IEntityCrudFieldVariant";


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
  isItemEditable: (item?: any) => boolean
  isItemDeletable: (item?: any) => boolean
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
  exportHeadersTranslate?: string[]
  exportFileName: string

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
  cleanFilterClass?: string
  applyFilterClass?: string

  cancelBtnFormClass?: string
  submitBtnFormClass?: string

  tabs?: string[]
  menus?: string[]
  menuMaxHeight?: string

  refs: IEntityCrudRefs
  getRef(ref: string | undefined): IEntityCrud

  rules: IEntityCrudRules
  getRule(field: string | undefined): Array<Function> | undefined

  provider: IDraxCrudProvider<any, any, any>

  inputVariantCreate?: IEntityCrudFieldVariant
  inputVariantEdit?: IEntityCrudFieldVariant
  inputVariantView?: IEntityCrudFieldVariant
  inputVariantDelete?: IEntityCrudFieldVariant
}


export type {IEntityCrud}
