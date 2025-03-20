import {ISetting, ISettingBase} from "@drax/settings-share";
import {IDraxCrudRepository} from "@drax/crud-share";
interface ISettingRepository extends IDraxCrudRepository<ISetting,ISettingBase,ISettingBase>{
}

export {ISettingRepository}
