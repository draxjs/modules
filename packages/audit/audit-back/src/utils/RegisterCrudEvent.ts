import {AuditServiceFactory} from "../factory/services/AuditServiceFactory.js";
import {IDraxCrudEvent} from "@drax/crud-share";
import { IAuditBase} from "@drax/audit-share";

interface IChange{
    field: string;
    old: any;
    new: any;
}

async function RegisterCrudEvent(crudEventData: IDraxCrudEvent){

    function diff(preItem: any = {}, postItem: any = {}): IChange[] {
        const changes: IChange[] = [];

        const ignoredFields = ['_id', 'createdAt', 'updatedAt', 'createdBy','$__','$isNew', '$errors'];

        // Si no hay preItem (creación), registrar todos los campos como nuevos
        if (!preItem) {
            preItem = {}
            if (postItem) {
                Object.keys(postItem).forEach(key => {
                    // Ignorar campos internos de MongoDB y timestamps
                    if (!key.startsWith('_') && !ignoredFields.includes(key)) {
                        changes.push({
                            field: key,
                            old: undefined,
                            new: postItem[key]
                        });
                    }
                });
            }
            return changes;
        }

        // Si no hay postItem (eliminación), registrar todos los campos como eliminados
        if (!postItem) {
            postItem = {}
            Object.keys(preItem).forEach(key => {
                // Ignorar campos internos de MongoDB y timestamps
                if (!key.startsWith('_') && !ignoredFields.includes(key)) {
                    changes.push({
                        field: key,
                        old: preItem[key],
                        new: undefined
                    });
                }
            });
            return changes;
        }

        // Función para comparar valores teniendo en cuenta ObjectId y populated
        function areValuesEqual(oldValue: any, newValue: any): boolean {
            // Si son exactamente iguales
            if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
                return true;
            }

            // Comparar referencias (ObjectId vs objeto poblado)
            const oldId = extractId(oldValue);
            const newId = extractId(newValue);

            if (oldId && newId) {
                return oldId.toString() === newId.toString();
            }

            // Si uno es array y el otro también, comparar elementos
            if (Array.isArray(oldValue) && Array.isArray(newValue)) {
                if (oldValue.length !== newValue.length) {
                    return false;
                }
                return oldValue.every((item, index) =>
                    areValuesEqual(item, newValue[index])
                );
            }

            return false;
        }

        function extractId(value: any): any {
            // Si es un ObjectId directo
            if (value && typeof value === 'object' && value._id) {
                return value._id;
            }
            // Si es directamente un ObjectId
            if (value && typeof value === 'object' && value.toString && value.constructor.name === 'ObjectId') {
                return value;
            }
            return null;
        }

        // Obtener todas las claves únicas de ambos objetos
        const allKeys = new Set([...Object.keys(preItem), ...Object.keys(postItem)]);

        allKeys.forEach(key => {
            // Ignorar campos internos de MongoDB y timestamps
            if (key.startsWith('_') || ignoredFields.includes(key)) {
                return;
            }

            const oldValue = preItem[key];
            const newValue = postItem[key];

            // Comparar valores usando la nueva función
            if (!areValuesEqual(oldValue, newValue)) {
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
        resourceId: crudEventData.resourceId || crudEventData.postItem?._id?.toString() || crudEventData.preItem?._id?.toString(),
        changes: changes,
        createdAt: crudEventData.timestamp,
        detail: crudEventData.detail,
        entity: crudEventData.entity,
        tenant: {
            id: crudEventData.user?.tenant?.id,
            name: crudEventData.user?.tenant?.name
        },
        user: {
            id: crudEventData.user.id,
            username: crudEventData.user.username,
            rolName: crudEventData.user.role?.name,
        },
        apiKey: {
            id: crudEventData.user?.apiKey?.id,
            name: crudEventData.user?.apiKey?.name
        },
        ip: crudEventData.ip,
        userAgent: crudEventData.userAgent,
        sessionId: crudEventData.user.session,
        requestId: crudEventData.requestId,
    }

    return await AuditServiceFactory.instance.create(data)
}

export {RegisterCrudEvent}
export default RegisterCrudEvent
