const messages = {
    en: {

        audit: {
            entity: 'Audit',
            menu: 'Audit',
            crud: 'Manage Audit',
            dashboard: 'Audit Dashboard',
            field: {
                entity: 'entity',
                user: 'user',
                id: 'id',
                username: 'username',
                rolName: 'rolName',
                action: 'action',
                ip: 'ip',
                userAgent: 'userAgent',
                changes: 'changes',
                field: 'field',
                old: 'old value',
                new: 'new value',
                sessionId: 'sessionId',
                requestId: 'requestId',
                detail: 'detail',
                tenant: 'tenant',
                apiKey: 'apiKey',
                name: 'name',
                createdAt: 'Created at',
                resourceId: 'Resource ID',
            }
        },
        permission: {
            'audit:view': 'View Audit',
            'audit:create': 'Create Audit',
            'audit:update': 'Edit Audit',
            'audit:delete': 'Delete Audit',
            'audit:manage': 'Manage Audit',
        }
    },
    es: {
        audit: {
            entity: 'Audit',
            menu: 'Audit',
            crud: 'Gestionar Audit',
            dashboard: 'Audit Dashboard',
            field: {
                entity: 'Entidad',
                user: 'Usuario',
                id: 'id',
                username: 'Nombre de Usuario',
                rolName: 'Nombre del Rol',
                action: 'Acción',
                ip: 'IP',
                userAgent: 'UserAgent',
                changes: 'Cambios',
                field: 'Campo',
                old: 'Antiguo valor',
                new: 'Nuevo valor',
                sessionId: 'ID de Sesión',
                requestId: 'ID de Petición',
                detail: 'Detalle',
                tenant: 'Tenant',
                apiKey: 'ApiKey',
                name: 'Nombre',
                createdAt: 'Creado en',
                resourceId: 'ID de Recurso',
            }
        },
        permission: {
            'audit:view': 'Ver Audit',
            'audit:create': 'Crear Audit',
            'audit:update': 'Editar Audit',
            'audit:delete': 'Eliminar Audit',
            'audit:manage': 'Gestionar Audit',
        }
    }
}

export default messages;
