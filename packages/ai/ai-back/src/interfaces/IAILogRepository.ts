
import type {IAILog, IAILogBase} from '@drax/ai-share'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IAILogRepository extends IDraxCrudRepository<IAILog, IAILogBase, IAILogBase>{

}

export {IAILogRepository}


