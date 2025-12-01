import {AuditServiceFactory} from "../factory/services/AuditServiceFactory.js";
import {IDraxCrudEvent} from "@drax/crud-share";
import { IAuditBase} from "@drax/audit-share";

interface IChange{
    field: string;
    old: any;
    new: any;
}

async function RegisterCrudEvent(crudEventData: IDraxCrudEvent){

    function diff(preItem: any, postItem: any): IChange[] {
        const changes: IChange[] = [];

        // Si no hay preItem (creación), no hay cambios que registrar
        if (!preItem) {
            return changes;
        }

        // Si no hay postItem (eliminación), registrar todos los campos como eliminados
        if (!postItem) {
            Object.keys(preItem).forEach(key => {
                // Ignorar campos internos de MongoDB y timestamps
                if (!key.startsWith('_') && key !== 'createdAt' && key !== 'updatedAt') {
                    changes.push({
                        field: key,
                        old: preItem[key],
                        new: undefined
                    });
                }
            });
            return changes;
        }

        // Obtener todas las claves únicas de ambos objetos
        const allKeys = new Set([...Object.keys(preItem), ...Object.keys(postItem)]);

        allKeys.forEach(key => {
            // Ignorar campos internos de MongoDB y timestamps
            if (key.startsWith('_') || key === 'createdAt' || key === 'updatedAt') {
                return;
            }

            const oldValue = preItem[key];
            const newValue = postItem[key];

            // Comparar valores
            if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                changes.push({
                    field: key,
                    old: oldValue,
                    new: newValue
                });
            }
        });

        return changes;
    }

    let changes:IChange[] = diff(crudEventData.preItem, crudEventData.postItem)

    let data: IAuditBase = {
        action: crudEventData.action,
        changes: changes,
        createdAt: crudEventData.timestamp,
        detail: "",
        entity: crudEventData.entity,
        tenant: {
            id: crudEventData.user.tenant.id,
            name: crudEventData.user.tenant.name
        },
        user: {
            id: crudEventData.user.id,
            username: crudEventData.user.username,
            rolName: crudEventData.user.role.name,
        },
        ip: crudEventData.ip,
        userAgent: crudEventData.userAgent,
        sessionId: crudEventData.user.session,
        requestId: crudEventData.requestId
    }

    return await AuditServiceFactory.instance.create(data)
}

export {RegisterCrudEvent}
export default RegisterCrudEvent
