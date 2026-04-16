
import type {IAILog, IAILogBase} from './IAILog'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IAILogRepository extends IDraxCrudRepository<IAILog, IAILogBase, IAILogBase>{

}

export {IAILogRepository}


