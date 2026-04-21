import type {IDraxCrudRepository} from "@drax/crud-share";
import type {ICrudSavedQuery, ICrudSavedQueryBase} from "./ICrudSavedQuery";

interface ICrudSavedQueryRepository extends IDraxCrudRepository<ICrudSavedQuery, ICrudSavedQueryBase, ICrudSavedQueryBase> {
}

export {ICrudSavedQueryRepository};
