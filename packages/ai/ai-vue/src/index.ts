import AiRoutes from './routes/index'
import AILogCrudPage from './pages/crud/AILogCrudPage.vue'
import AILogCrud from './components/cruds/AILogCrud.vue'
import DraxAgent from './components/DraxAgent.vue'
import DraxAgentButton from './components/DraxAgentButton.vue'
import AILogEntityCrud from './cruds/AILogCrud'
import {useDraxAgent} from './composables'
import type {ChatMessage} from './composables'


export {
    //ROUTES
    AiRoutes,
    //PAGES
    AILogCrudPage,
    //COMPONENTS
    AILogCrud,
    DraxAgent,
    DraxAgentButton,
    useDraxAgent,
    //CRUD
    AILogEntityCrud,
}

export type {
    ChatMessage,
}
