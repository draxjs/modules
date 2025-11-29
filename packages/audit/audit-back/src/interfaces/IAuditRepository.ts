
import type {IAudit, IAuditBase} from '@drax/audit-share'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IAuditRepository extends IDraxCrudRepository<IAudit, IAuditBase, IAuditBase>{

}

export {IAuditRepository}


