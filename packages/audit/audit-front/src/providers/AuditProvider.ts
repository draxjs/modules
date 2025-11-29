
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IAudit, IAuditBase} from '@drax/audit-share'

class AuditProvider extends AbstractCrudRestProvider<IAudit, IAuditBase, IAuditBase> {

  static singleton: AuditProvider

  constructor() {
   super('/api/audits')
  }

  static get instance() {
    if(!AuditProvider.singleton){
      AuditProvider.singleton = new AuditProvider()
    }
    return AuditProvider.singleton
  }

}

export default AuditProvider

