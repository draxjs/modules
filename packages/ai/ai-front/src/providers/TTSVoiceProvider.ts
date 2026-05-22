import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ITTSVoice, ITTSVoiceBase} from '@drax/ai-share'

class TTSVoiceProvider extends AbstractCrudRestProvider<ITTSVoice, ITTSVoiceBase, ITTSVoiceBase> {

  static singleton: TTSVoiceProvider

  constructor() {
    super('/api/ttsvoice')
  }

  static get instance() {
    if (!TTSVoiceProvider.singleton) {
      TTSVoiceProvider.singleton = new TTSVoiceProvider()
    }
    return TTSVoiceProvider.singleton
  }

}

export default TTSVoiceProvider
