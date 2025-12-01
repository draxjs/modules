import DashboardPermissions from './permissions/DashboardPermissions.js'
import DashboardSchema from './schemas/DashboardSchema.js'
import DashboardModel from './models/DashboardModel.js'
import DashboardRepository from './repository/DashboardRepository.js'
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
    DashboardRepository,
    DashboardService,
    DashboardServiceFactory,
    DashboardController,
    DashboardRoutes
}
