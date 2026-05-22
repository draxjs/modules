import {AbstractMongoRepository} from "@drax/crud-back";
import {TTSVoiceModel} from "../../models/TTSVoiceModel.js";
import type {ITTSVoiceRepository} from '../../interfaces/ITTSVoiceRepository'
import type {ITTSVoice, ITTSVoiceBase} from "../../interfaces/ITTSVoice";

class TTSVoiceMongoRepository extends AbstractMongoRepository<ITTSVoice, ITTSVoiceBase, ITTSVoiceBase> implements ITTSVoiceRepository {

    constructor() {
        super();
        this._model = TTSVoiceModel;
        this._searchFields = ['name', 'ttsProvider', 'voiceId', 'model', 'languageCode'];
        this._populateFields = ['tenant', 'user'];
        this._lean = true
    }

}

export default TTSVoiceMongoRepository
export {TTSVoiceMongoRepository}
