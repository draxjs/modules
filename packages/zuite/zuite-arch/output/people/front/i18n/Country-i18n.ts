
const messages = {
  en: {
  
    country: {
          entity: 'Country',
          menu: 'Country',
          crud: 'Manage Country',
          field:{
                       name:'name',
           description:'description',
           flag:'flag',
           metadata:'metadata',
           tenant:'tenant',
           createdBy:'createdBy'
          }
      },
      permission: {
              'country:view': 'View Country',
              'country:create': 'Create Country',
              'country:update': 'Edit Country',
              'country:delete': 'Delete Country',
              'country:manage': 'Manage Country',
      }
  },
  es: {
     country: {
          entity: 'Country',
          menu: 'Country',
          crud: 'Gestionar Country',
          field:{
                       name:'name',
           description:'description',
           flag:'flag',
           metadata:'metadata',
           tenant:'tenant',
           createdBy:'createdBy'
          }
      },
     permission: {
              'country:view': 'Ver Country',
              'country:create': 'Crear Country',
              'country:update': 'Editar Country',
              'country:delete': 'Eliminar Country',
              'country:manage': 'Gestionar Country',
     }
  }
}

export default messages;  
