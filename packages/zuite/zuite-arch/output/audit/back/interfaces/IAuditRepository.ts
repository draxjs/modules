
import type {IAudit, IAuditBase} from './IAudit'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IAuditRepository extends IDraxCrudRepository<IAudit, IAuditBase, IAuditBase>{

}

export {IAuditRepository}


