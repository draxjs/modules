
import AuditRepository from '../../repository/AuditRepository.js'
import {AuditService} from '../../services/AuditService.js'
import {AuditBaseSchema} from "../../schemas/AuditSchema.js";

class AuditServiceFactory {
    private static service: AuditService;

    public static get instance(): AuditService {
        if (!AuditServiceFactory.service) {
            const repository = new AuditRepository();
            const schema = AuditBaseSchema;
            AuditServiceFactory.service = new AuditService(repository, schema);
        }
        return AuditServiceFactory.service;
    }
}

export default AuditServiceFactory
export {
    AuditServiceFactory
}

