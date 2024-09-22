
import type {IPerson, IPersonBase} from './IPerson'
import {ICrudRepository} from "@drax/crud-back";

interface IPersonRepository extends ICrudRepository<IPerson, IPersonBase, IPersonBase>{

}

export {IPersonRepository}


