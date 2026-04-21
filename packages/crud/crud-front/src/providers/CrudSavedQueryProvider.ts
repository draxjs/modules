import AbstractCrudRestProvider from "./AbstractCrudRestProvider.js";
import type {ICrudSavedQuery, ICrudSavedQueryBase} from "@drax/crud-share";

class CrudSavedQueryProvider extends AbstractCrudRestProvider<ICrudSavedQuery, ICrudSavedQueryBase, ICrudSavedQueryBase> {
    static singleton: CrudSavedQueryProvider;

    constructor() {
        super("/api/crud-saved-queries");
    }

    static get instance() {
        if (!CrudSavedQueryProvider.singleton) {
            CrudSavedQueryProvider.singleton = new CrudSavedQueryProvider();
        }
        return CrudSavedQueryProvider.singleton;
    }
}

export default CrudSavedQueryProvider;
export {CrudSavedQueryProvider};
