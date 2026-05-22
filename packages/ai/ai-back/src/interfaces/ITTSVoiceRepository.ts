import type {ITTSVoice, ITTSVoiceBase} from './ITTSVoice'
import {IDraxCrudRepository} from "@drax/crud-share";

interface ITTSVoiceRepository extends IDraxCrudRepository<ITTSVoice, ITTSVoiceBase, ITTSVoiceBase> {

}

export {ITTSVoiceRepository}
