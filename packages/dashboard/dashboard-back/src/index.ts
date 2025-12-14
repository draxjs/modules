import DashboardPermissions from './permissions/DashboardPermissions.js'
import DashboardSchema from './schemas/DashboardSchema.js'
import DashboardModel from './models/DashboardModel.js'
import DashboardMongoRepository from './repository/mongo/DashboardMongoRepository.js'
import DashboardSqliteRepository from './repository/sqlite/DashboardSqliteRepository.js'
import DashboardService from './services/DashboardService.js'
import DashboardServiceFactory from './factory/services/DashboardServiceFactory.js'
import DashboardController from './controllers/DashboardController.js'
import DashboardRoutes from './routes/DashboardRoutes.js'
import type {IDashboardRepository} from './interfaces/IDashboardRepository'

export type{
   IDashboardRepository
}

export {
    DashboardPermissions,
    DashboardSchema,
    DashboardModel,
    DashboardMongoRepository,
    DashboardSqliteRepository,
    DashboardService,
    DashboardServiceFactory,
    DashboardController,
    DashboardRoutes
}
