import AbstractService from "../../services/AbstractService.js";
import type {ZodObject, ZodRawShape} from "zod";
import type {ICrudSavedQueryRepository} from "../interfaces/ICrudSavedQueryRepository";
import type {ICrudSavedQuery, ICrudSavedQueryBase} from "../interfaces/ICrudSavedQuery";

class CrudSavedQueryService extends AbstractService<ICrudSavedQuery, ICrudSavedQueryBase, ICrudSavedQueryBase> {
    constructor(repository: ICrudSavedQueryRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(repository, baseSchema, fullSchema);
    }
}

export default CrudSavedQueryService;
export {CrudSavedQueryService};
