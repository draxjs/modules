import {SettingServiceFactory} from "@drax/settings-back"


async function InitializeSettings() {
    const settingService = SettingServiceFactory()

    await settingService.createOrUpdate({
        category: 'Grupo 1',
        key: 'STRING',
        value: 'ASD',
        label: 'String',
        type: 'string',
        prefix: 'Prefijo',
        suffix: 'Sufijo',
        public: true,
        description: "La mar en coche"
    })

    await settingService.createOrUpdate({
        category: 'Grupo 1',
        key: 'NUMBER',
        value: '2',
        label: 'Number',
        type: 'number',
        prefix: '',
        suffix: 'HS',
        public: true,
        description: "Locomotora loca"
    })


    await settingService.createOrUpdate({
        category: 'Grupo 1',
        key: 'BOOLEAN',
        value: 'true',
        label: 'Boolean',
        type: 'boolean',
        prefix: '',
        suffix: '',
        public: false,
        description: "El estado de la coche"
    })

    await settingService.createOrUpdate({
        category: 'Grupo 1',
        key: 'LONG_STRING',
        value: 'LONGOOOSSS',
        label: 'LongString',
        type: 'longString',
        prefix: '',
        suffix: '',
        public: true,
        permission: 'setting:sensitive',
        description: 'La guardia del leon'
    })


    await settingService.createOrUpdate({
        category: 'Grupo 2',
        key: 'ENUM',
        value: null,
        label: 'Enum',
        type: 'enum',
        options: ['Option 1', 'Option 2', 'Option 3'],
        prefix: '',
        suffix: '',
        public: false
    })


    await settingService.createOrUpdate({
        category: 'Grupo 2',
        key: 'PASSWORD',
        value: null,
        label: 'Password',
        type: 'password',
        prefix: '',
        suffix: '',
        public: false
    })

    await settingService.createOrUpdate({
        category: 'Grupo 3',
        key: 'STRINGLIST',
        value: null,
        label: 'StringList',
        type: 'stringList',
        prefix: '',
        suffix: '',
        public: false,
        permission: 'setting:sensitive'
    })

    await settingService.createOrUpdate({
        category: 'Grupo 3',
        key: 'NUMBERLIST',
        value: null,
        label: 'NumberList',
        type: 'numberList',
        prefix: '',
        suffix: '',
        public: false,
        permission: 'setting:sensitive'
    })

    await settingService.createOrUpdate({
        category: 'Grupo 3',
        key: 'ENUMLIST',
        value: null,
        label: 'EnumList',
        options: ['Option 1', 'Option 2', 'Option 3'],
        type: 'enumList',
        prefix: '',
        suffix: '',
        public: false,
        permission: 'setting:sensitive'
    })


    await settingService.createOrUpdate({
        category: 'Grupo 2',
        key: 'EntityRole',
        value: null,
        label: 'Role',
        type: 'ref',
        prefix: '',
        suffix: '',
        public: false,
        entity: 'Role',
        entityValue: '_id',
        entityText: 'name',
    })


    await settingService.createOrUpdate({
        category: 'VALIDATION',
        key: 'ValidateRegex',
        value: '',
        label: 'String',
        type: 'string',
        prefix: '',
        suffix: '',
        regex: '^[a-zA-Z]+$',
        public: true
    })




    await settingService.createOrUpdate({
        category: 'API',
        key: 'API_BASE_URL',
        value: 'https://api.example.com',
        label: 'API Base URL',
        type: 'string',
        description: 'Base URL for all API requests',
        prefix: 'https://',
        suffix: '/v1',
        public: true,
    })

    await settingService.createOrUpdate({
        category: 'API',
        key: 'MAX_RETRY_ATTEMPTS',
        value: "3",
        label: 'MAX_RETRY_ATTEMPTS',
        type: 'number',
        description: 'Maximum number of retry attempts for API calls',
        prefix: '',
        suffix: '',
        public: false,
    })


    await settingService.createOrUpdate({
        category: 'API',
        key: 'WEBHOOK_ENDPOINT',
        value: 'https://webhook.example.com/events',
        label: 'Webhook Endpoint',
        type: 'string',
        prefix: 'https://',
        suffix: '?auth=token',
        public: false,
        description: "Webhook endpoint for event notifications",
    })

    await settingService.createOrUpdate({
        category: 'API',
        key: 'MASTER_USER',
        value: undefined,
        label: 'Master User',
        type: 'ref',
        entity: 'User',
        entityValue: '_id',
        entityText: 'name',
        prefix: '',
        suffix: '',
        public: false,
        description: 'User that will be used as master for system operations',
    })


    await settingService.createOrUpdate({
        category: 'Analytics',
        key: 'ENABLE_ANALYTICS',
        value: "true",
        label: 'Enable Analytics',
        type: 'boolean',
        prefix: '',
        suffix: '',
        public: false,
        description: 'Enable or disable analytics collection',
    })


    await settingService.createOrUpdate({
        category: 'Database',
        key: 'DATABASE_PASSWORD',
        value: 'password123',
        label: 'DATABASE_PASSWORD',
        type: 'secret',
        prefix: 'PREFIX_',
        suffix: '_SUFFIX',
        public: false,
        description: 'Database password for connection',
    })

    await settingService.createOrUpdate({
        category: 'Database',
        key: 'DATABASE_CONNECTION_STRING',
        value: 'conection_string_database',
        label: 'Database Connection String',
        type: 'password',
        prefix: 'postgresql://user:pass@',
        suffix: '?sslmode=require',
        public: false,
        description: 'Connection string for the database',
    })

    await settingService.createOrUpdate({
        category: 'Legal',
        key: 'TERMS_OF_SERVICE',
        value: 'By using this service, you agree to our terms and conditions. This includes but is not limited to: respecting user privacy, not engaging in illegal activities, maintaining account security, and adhering to our community guidelines. We reserve the right to terminate accounts that violate these terms. For more detailed information, please visit our website.',
        label: 'Terms of Service',
        type: 'longString',
        prefix: '',
        suffix: '',
        public: true,
        permission: 'setting:sensitive',
        description: 'Terms of service agreement text',
    })

    await settingService.createOrUpdate({
        category: 'Localization',
        key: 'SUPPORTED_LANGUAGES',
        value: "es",
        label: 'Supported Languages',
        type: 'enumList',
        options: ['es', 'en', 'fr'],
        prefix: '',
        suffix: '',
        public: true,
        description: 'List of supported languages for the application',
    })

    await settingService.createOrUpdate({
        category: 'Security',
        key: 'ALLOWED_EMAILS',
        value: '',
        label: 'Allowed Email Domains',
        type: 'stringList',
        prefix: '',
        suffix: '',
        public: false,
        description: 'List of allowed email addresses for admin access',
    })

    await settingService.createOrUpdate({
        category: 'Security',
        key: 'RATE_LIMIT_WINDOWS',
        value: '',
        label: 'Rate Limit Windows',
        type: 'numberList',
        prefix: '',
        suffix: '',
        public: false,
        description: 'Time windows for rate limiting in seconds',
    })

    await settingService.createOrUpdate({
        category: 'System',
        key: 'LOG_LEVEL',
        value: 'info',
        label: 'Log Level',
        type: 'enum',
        options: ['debug', 'info', 'warn', 'error'],
        prefix: '',
        suffix: '',
        public: false,
        description: 'Log level for the application (debug, info, warn, error)',
    })

    await settingService.createOrUpdate({
        category: 'Theming',
        key: 'TENANT_THEME_COLOR',
        value: '#007bff',
        label: 'Tenant Theme Color',
        type: 'string',
        prefix: '',
        suffix: '',
        public: true,
        description: 'Default tenant theme color for the application (hex color code)',
    })
}


export default InitializeSettings
export {InitializeSettings}
