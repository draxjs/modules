import type {ITTSVoiceRepository} from "../interfaces/ITTSVoiceRepository";
import type {ITTSVoiceBase, ITTSVoice} from "../interfaces/ITTSVoice";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class TTSVoiceService extends AbstractService<ITTSVoice, ITTSVoiceBase, ITTSVoiceBase> {

    constructor(TTSVoiceRepository: ITTSVoiceRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(TTSVoiceRepository, baseSchema, fullSchema);
        this._validateOutput = true
    }

}

export default TTSVoiceService
export {TTSVoiceService}
