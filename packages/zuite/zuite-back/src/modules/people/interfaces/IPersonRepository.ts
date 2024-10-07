
import type {IPerson, IPersonBase} from './IPerson'
import {IDraxCrud} from "@drax/crud-share";

interface IPersonRepository extends IDraxCrud<IPerson, IPersonBase, IPersonBase>{

}

export {IPersonRepository}


