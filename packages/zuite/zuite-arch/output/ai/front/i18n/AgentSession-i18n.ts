
const messages = {
  en: {
  
    agentsession: {
          entity: 'AgentSession',
          menu: 'AgentSession',
          crud: 'Manage AgentSession',
          field:{
                       sessionId:'sessionId',
           title:'title',
           lastMessageAt:'lastMessageAt',
           messages:'messages',
           role: 'role',
           content: 'content',
           createdAt: 'createdAt',
           messageCount:'messageCount',
           inputTokens:'inputTokens',
           outputTokens:'outputTokens',
           tokens:'tokens',
           tenant:'tenant',
           user:'user'
          }
      },
      permission: {
              'agentsession:view': 'View AgentSession',
              'agentsession:create': 'Create AgentSession',
              'agentsession:update': 'Edit AgentSession',
              'agentsession:delete': 'Delete AgentSession',
              'agentsession:manage': 'Manage AgentSession',
      }
  },
  es: {
     agentsession: {
          entity: 'AgentSession',
          menu: 'AgentSession',
          crud: 'Gestionar AgentSession',
          field:{
                       sessionId:'sessionId',
           title:'title',
           lastMessageAt:'lastMessageAt',
           messages:'messages',
           role: 'role',
           content: 'content',
           createdAt: 'createdAt',
           messageCount:'messageCount',
           inputTokens:'inputTokens',
           outputTokens:'outputTokens',
           tokens:'tokens',
           tenant:'tenant',
           user:'user'
          }
      },
     permission: {
              'agentsession:view': 'Ver AgentSession',
              'agentsession:create': 'Crear AgentSession',
              'agentsession:update': 'Editar AgentSession',
              'agentsession:delete': 'Eliminar AgentSession',
              'agentsession:manage': 'Gestionar AgentSession',
     }
  }
}

export default messages;  
