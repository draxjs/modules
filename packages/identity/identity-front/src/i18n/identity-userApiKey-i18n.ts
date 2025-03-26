const messages = {
    en: {
        userapikey: {
            entity: 'ApiKey',
            menu: 'ApiKeys',
            crud: 'Manage UserApiKey',
            field:{
                name: "Reference Name",
                secret: "Secret",
                ipv4: "Allowed IPV4",
                ipv6: "Allowed IPV6",
                user: "User",
                createdAt: 'Created At',
                createdBy: 'Created By',
            },
            secretWarning: "ApiKey only shows once. Keep the ApiKey securely.",
            created: 'ApiKey created successfully',

        }
    },
    es: {
        userapikey:{
            entity: 'ApiKey',
            menu: 'ApiKeys',
            crud: 'Gestionar ApiKey',
            field:{
                name: "Nombre de referencia",
                secret: "Secreto",
                ipv4: "IPv4 permitidos",
                ipv6: "IPv6 permitidos",
                user: "Usuario",
                createdAt: 'Fecha Creación',
                createdBy: 'Creado por',
            },
            secretWarning: "La ApiKey solo se muestra una vez. Guarde la ApiKey de forma segura.",
            created: 'ApiKey creado con éxito',

        }
    }
}


export default messages
