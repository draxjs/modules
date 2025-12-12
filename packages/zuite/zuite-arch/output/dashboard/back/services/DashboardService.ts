
import type{IDashboardRepository} from "../interfaces/IDashboardRepository";
import type {IDashboardBase, IDashboard} from "../interfaces/IDashboard";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class DashboardService extends AbstractService<IDashboard, IDashboardBase, IDashboardBase> {

    constructor(DashboardRepository: IDashboardRepository, schema?: ZodObject<ZodRawShape>) {
        super(DashboardRepository, schema);
    }

}

export default DashboardService
export {DashboardService}
