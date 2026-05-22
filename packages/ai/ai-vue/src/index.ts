import AiRoutes from './routes/index'
import AILogCrudPage from './pages/crud/AILogCrudPage.vue'
import TTSVoiceCrudPage from './pages/crud/TTSVoiceCrudPage.vue'
import DraxAgentPage from './pages//DraxAgentPage.vue'
import DraxAgentExpressPage from './pages//DraxAgentExpressPage.vue'
import AILogCrud from './components/cruds/AILogCrud.vue'
import TTSVoiceCrud from './components/cruds/TTSVoiceCrud.vue'
import DraxAgent from './components/DraxAgent.vue'
import DraxAgentButton from './components/DraxAgentButton.vue'
import DraxAgentExpress from './components/DraxAgentExpress.vue'
import VJarvisBot from './components/vbots/VJarvisBot.vue'
import VManagerBot from './components/vbots/VManagerBot.vue'
import VNexusBot from './components/vbots/VNexusBot.vue'
import VRobotBot from './components/vbots/VRobotBot.vue'
import AILogEntityCrud from './cruds/AILogCrud'
import TTSVoiceEntityCrud from './cruds/TTSVoiceCrud'
import {useDraxAgent} from './composables'
import type {ChatMessage} from './composables'


export {
    //ROUTES
    AiRoutes,
    //PAGES
    AILogCrudPage,
    TTSVoiceCrudPage,
    DraxAgentPage,
    DraxAgentExpressPage,
    //COMPONENTS
    AILogCrud,
    TTSVoiceCrud,
    DraxAgent,
    DraxAgentButton,
    DraxAgentExpress,
    VJarvisBot,
    VManagerBot,
    VNexusBot,
    VRobotBot,
    useDraxAgent,
    //CRUD
    AILogEntityCrud,
    TTSVoiceEntityCrud,
}

export type {
    ChatMessage,
}
