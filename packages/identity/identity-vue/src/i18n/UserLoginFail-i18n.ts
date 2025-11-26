
const messages = {
  en: {
  
    userloginfail: {
          entity: 'UserLoginFail',
          menu: 'UserLoginFail',
          crud: 'Manage UserLoginFail',
          field:{
                       user:'user',
           agent:'agent',
           ip:'ip',
           createdAt:'createdAt'
          }
      },
      permission: {
              'userloginfail:view': 'View UserLoginFail',
              'userloginfail:create': 'Create UserLoginFail',
              'userloginfail:update': 'Edit UserLoginFail',
              'userloginfail:delete': 'Delete UserLoginFail',
              'userloginfail:manage': 'Manage UserLoginFail',
      }
  },
  es: {
     userloginfail: {
          entity: 'UserLoginFail',
          menu: 'UserLoginFail',
          crud: 'Gestionar UserLoginFail',
          field:{
                       user:'user',
           agent:'agent',
           ip:'ip',
           createdAt:'createdAt'
          }
      },
     permission: {
              'userloginfail:view': 'Ver UserLoginFail',
              'userloginfail:create': 'Crear UserLoginFail',
              'userloginfail:update': 'Editar UserLoginFail',
              'userloginfail:delete': 'Eliminar UserLoginFail',
              'userloginfail:manage': 'Gestionar UserLoginFail',
     }
  }
}

export default messages;  
