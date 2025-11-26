
import type {IDashboard, IDashboardBase} from './IDashboard'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IDashboardRepository extends IDraxCrudRepository<IDashboard, IDashboardBase, IDashboardBase>{

}

export {IDashboardRepository}


