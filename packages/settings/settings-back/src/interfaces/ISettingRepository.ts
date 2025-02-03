import {ISetting, ISettingBase} from "@drax/settings-share";
import {IDraxCrud} from "@drax/crud-share";
interface ISettingRepository extends IDraxCrud<ISetting,ISettingBase,ISettingBase>{
}

export {ISettingRepository}
