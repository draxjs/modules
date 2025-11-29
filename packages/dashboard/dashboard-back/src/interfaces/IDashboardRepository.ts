
import type {IDashboard, IDashboardBase} from '@drax/dashboard-share'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IDashboardRepository extends IDraxCrudRepository<IDashboard, IDashboardBase, IDashboardBase>{

}

export {IDashboardRepository}


