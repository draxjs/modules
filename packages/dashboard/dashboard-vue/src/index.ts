import {DashboardCrudRoute} from './routes/DashboardCrudRoute'
import DashboardCrudPage from './pages/crud/DashboardCrudPage.vue'
import DashboardViewPage from './pages/DashboardViewPage.vue'
import DashboardView from './components/DashboardView/DashboardView.vue'
import DashboardCombobox from './combobox/DashboardCombobox.vue'
import {useDashboardCard} from './composables/UseDashboardCard'
import {useDashboardStore} from './stores/UseDashboardStore'
import DashboardCrud from './cruds/DashboardCrud'


export {
    //ROUTES
    DashboardCrudRoute,
    //PAGES
    DashboardCrudPage,
    DashboardViewPage,
    //COMPONENTS
    DashboardView,
    DashboardCombobox,
    //CRUD
    DashboardCrud,
    //STORES
    useDashboardStore,
    //COMPOSABLES
    useDashboardCard
}
