
import type{IAuditRepository} from "../interfaces/IAuditRepository";
import type {IAuditBase, IAudit} from "@drax/audit-share";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class AuditService extends AbstractService<IAudit, IAuditBase, IAuditBase> {

    constructor(AuditRepository: IAuditRepository, schema?: ZodObject<ZodRawShape>) {
        super(AuditRepository, schema);
    }

}

export default AuditService
export {AuditService}
