
import type {ICovenant, ICovenantBase} from './ICovenant'
import {IDraxCrudRepository} from "@drax/crud-share";

interface ICovenantRepository extends IDraxCrudRepository<ICovenant, ICovenantBase, ICovenantBase>{

}

export {ICovenantRepository}


