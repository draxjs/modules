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
        public: true
    })

    await settingService.createOrUpdate({
        category: 'Grupo 1',
        key: 'NUMBER',
        value: '2',
        label: 'Number',
        type: 'number',
        prefix: '',
        suffix: 'HS',
        public: true
    })


    await settingService.createOrUpdate({
        category: 'Grupo 1',
        key: 'BOOLEAN',
        value: 'true',
        label: 'Boolean',
        type: 'boolean',
        prefix: '',
        suffix: '',
        public: false
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
        permission: 'setting:sensitive'
    })


    await settingService.createOrUpdate({
        category: 'Grupo 2',
        key: 'ENUM',
        value: null,
        label: 'Enum',
        type: 'enum',
        options: ['Option 1', 'Option 2', 'Option 3'],
        prefix: 'PREFIX_',
        suffix: '_SUFFIX',
        public: false
    })


    await settingService.createOrUpdate({
        category: 'Grupo 2',
        key: 'PASSWORD',
        value: null,
        label: 'Password',
        type: 'password',
        prefix: 'PREFIX_',
        suffix: '_SUFFIX',
        public: false
    })

    await settingService.createOrUpdate({
        category: 'Grupo 3',
        key: 'STRINGLIST',
        value: null,
        label: 'StringList',
        type: 'stringList',
        prefix: 'PREFIX_',
        suffix: '_SUFFIX',
        public: false,
        permission: 'setting:sensitive'
    })

    await settingService.createOrUpdate({
        category: 'Grupo 3',
        key: 'NUMBERLIST',
        value: null,
        label: 'NumberList',
        type: 'numberList',
        prefix: 'PREFIX_',
        suffix: '_SUFFIX',
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
        prefix: 'PREFIX_',
        suffix: '_SUFFIX',
        public: false,
        permission: 'setting:sensitive'
    })
}


export default InitializeSettings
export {InitializeSettings}
