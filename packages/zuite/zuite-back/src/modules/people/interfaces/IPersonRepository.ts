
import type {IPerson, IPersonBase} from './IPerson'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IPersonRepository extends IDraxCrudRepository<IPerson, IPersonBase, IPersonBase>{

}

export {IPersonRepository}


