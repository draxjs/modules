
import type{IAILogRepository} from "../interfaces/IAILogRepository";
import type {IAILogBase, IAILog} from "@drax/ai-share";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class AILogService extends AbstractService<IAILog, IAILogBase, IAILogBase> {


    constructor(AILogRepository: IAILogRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(AILogRepository, baseSchema, fullSchema);

        this._validateOutput = true

    }

}

export default AILogService
export {AILogService}
