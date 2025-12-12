
import DashboardRepository from '../../repository/DashboardRepository.js'
import {DashboardService} from '../../services/DashboardService.js'
import {DashboardBaseSchema} from "../../schemas/DashboardSchema.js";

class DashboardServiceFactory {
    private static service: DashboardService;

    public static get instance(): DashboardService {
        if (!DashboardServiceFactory.service) {
            const repository = new DashboardRepository();
            const schema = DashboardBaseSchema;
            DashboardServiceFactory.service = new DashboardService(repository, schema);
        }
        return DashboardServiceFactory.service;
    }
}

export default DashboardServiceFactory
export {
    DashboardServiceFactory
}

