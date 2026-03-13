import {UserCrud, RoleCrud, TenantCrud} from "@drax/identity-vue"
import {FileEntityCrud} from "@drax/media-vue"
import PersonCrud from "../modules/people/cruds/PersonCrud"
import CountryCrud from "../modules/people/cruds/CountryCrud"
import LanguageCrud from "../modules/people/cruds/LanguageCrud"
import { useEntityStore } from '@drax/crud-vue'

function setupEntities(){
  const entityStore = useEntityStore()
  entityStore.addEntity(UserCrud.instance)
  entityStore.addEntity(RoleCrud.instance)
  entityStore.addEntity(TenantCrud.instance)
  entityStore.addEntity(PersonCrud.instance)
  entityStore.addEntity(CountryCrud.instance)
  entityStore.addEntity(LanguageCrud.instance)
  entityStore.addEntity(FileEntityCrud.instance)
}

export default setupEntities
