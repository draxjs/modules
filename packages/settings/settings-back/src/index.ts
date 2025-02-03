import {ISettingRepository} from "./interfaces/ISettingRepository";
export type {ISettingRepository};


import {SettingModel, SettingSchema} from "./model/SettingsModel.js"
import {SettingMongoRepository} from "./repository/mongo/SettingMongoRepository.js"
import {SettingService} from "./services/SettingService.js"
import SettingServiceFactory from "./factory/SettingServiceFactory.js"
import SettingController from "./controller/SettingController.js"
import SettingRoutes from "./routes/SettingRoutes.js"
import {SettingPermissions} from "./permissions/SettingPermissions.js"



export {
    SettingSchema,
    SettingModel,
    SettingMongoRepository,
    SettingService,
    SettingServiceFactory,
    SettingController,
    SettingRoutes,
    SettingPermissions
}
