const messages = {
    en: {

        file: {
            entity: 'File',
            menu: 'File',
            crud: 'Manage File',
            field: {
                filename: 'Filename',
                relativePath: 'Relative Path',
                absolutePath: 'Absolute Path',
                url: 'URL',
                description: 'Description',
                tags: 'Tags',
                mimetype: 'MIME Type',
                encoding: 'Encoding',
                extension: 'Extension',
                size: 'Size',
                type: 'Type',
                lastAccess: 'Last Access',
                createdAt: 'Created At',
                updatedAt: 'Updated At',
                createdBy: 'Created By',
                id: 'ID',
                username: 'Username',
                updatedBy: 'Updated By',
                createdFor: 'Created For',
                ttlSeconds: 'TTL (Seconds)',
                expiresAt: 'Expires At',
                isPublic: 'Is Public',
                hits: 'Hits / Views',
            },
            view: {
                details: 'Details',
                preview: 'Preview',
                unknownFile: 'Unknown File',
                noTags: 'No tags',
                noPreview: 'Preview not available',
                noPreviewDesc: 'A preview cannot be generated for this file type.',
                download: 'Download File',
                openExternal: 'Open External',
                system: 'System',
                noExpiration: 'No expiration'
            }
        },
        permission: {
            'file:view': 'View File',
            'file:create': 'Create File',
            'file:update': 'Edit File',
            'file:delete': 'Delete File',
            'file:manage': 'Manage File',
        }
    },
    es: {
        file: {
            entity: 'Archivo',
            menu: 'Archivos',
            crud: 'Gestionar Archivos',
            field: {
                filename: 'Nombre del Archivo',
                relativePath: 'Ruta Relativa',
                absolutePath: 'Ruta Absoluta',
                url: 'URL',
                description: 'Descripción',
                tags: 'Etiquetas',
                mimetype: 'Tipo MIME',
                encoding: 'Codificación',
                extension: 'Extensión',
                size: 'Tamaño',
                type: 'Tipo',
                lastAccess: 'Último Acceso',
                createdAt: 'Fecha de Creación',
                updatedAt: 'Fecha de Actualización',
                createdBy: 'Creado por',
                id: 'ID',
                username: 'Usuario',
                updatedBy: 'Actualizado por',
                createdFor: 'Creado para',
                ttlSeconds: 'TTL en Segundos',
                expiresAt: 'Fecha de Expiración',
                isPublic: 'Es Público',
                hits: 'Visualizaciones',
            },
            view: {
                details: 'Detalles',
                preview: 'Vista Previa',
                unknownFile: 'Archivo Desconocido',
                noTags: 'Sin etiquetas',
                noPreview: 'Vista previa no disponible',
                noPreviewDesc: 'No se puede generar una vista previa para este tipo de archivo.',
                download: 'Descargar Archivo',
                openExternal: 'Abrir Externo',
                system: 'Sistema',
                noExpiration: 'Sin expiración'
            }
        },
        permission: {
            'file:view': 'Ver File',
            'file:create': 'Crear File',
            'file:update': 'Editar File',
            'file:delete': 'Eliminar File',
            'file:manage': 'Gestionar File',
        }
    }
}

export default messages;
