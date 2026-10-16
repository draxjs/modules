
const messages = {
  en: {
  
    usersession: {
          entity: 'UserSession',
          menu: 'UserSession',
          crud: 'Manage UserSession',
          field:{
                       uuid:'uuid',
           user:'user',
           agent:'agent',
           ip:'ip',
           createdAt:'createdAt',
           rememberMe: 'Remember me',
           refreshExpiresAt: 'Remembered session expires at'
          }
      },
      permission: {
              'usersession:view': 'View UserSession',
              'usersession:create': 'Create UserSession',
              'usersession:update': 'Edit UserSession',
              'usersession:delete': 'Delete UserSession',
              'usersession:manage': 'Manage UserSession',
      }
  },
  es: {
     usersession: {
          entity: 'UserSession',
          menu: 'UserSession',
          crud: 'Gestionar UserSession',
          field:{
                       uuid:'uuid',
           user:'user',
           agent:'agent',
           ip:'ip',
           createdAt:'createdAt',
           rememberMe: 'Recordarme',
           refreshExpiresAt: 'Vencimiento de sesión recordada'
          }
      },
     permission: {
              'usersession:view': 'Ver UserSession',
              'usersession:create': 'Crear UserSession',
              'usersession:update': 'Editar UserSession',
              'usersession:delete': 'Eliminar UserSession',
              'usersession:manage': 'Gestionar UserSession',
     }
  }
}

export default messages;  
