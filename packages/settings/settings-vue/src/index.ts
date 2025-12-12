import {useSetting} from "./composables/UseSetting";
import {useSettingStore} from "./stores/UseSettingStore";
import SettingCardConfig from "./components/SettingCardConfig.vue";
import SettingTableConfig from "./components/SettingAvConfig.vue";
import SettingLoaded from "./components/SettingLoaded.vue";
import SettingPage from "./pages/SettingPage.vue";
import SettingRoutes from "./routes/SettingRoutes";


export{
    useSetting,
    useSettingStore,
    SettingCardConfig,
    SettingTableConfig,
    SettingLoaded,
    SettingPage,
    SettingRoutes
}
