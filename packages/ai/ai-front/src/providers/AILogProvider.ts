
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IAILog, IAILogBase} from '@drax/ai-share'

class AILogProvider extends AbstractCrudRestProvider<IAILog, IAILogBase, IAILogBase> {

  static singleton: AILogProvider

  constructor() {
   super('/api/ailog')
  }

  static get instance() {
    if(!AILogProvider.singleton){
      AILogProvider.singleton = new AILogProvider()
    }
    return AILogProvider.singleton
  }

}

export default AILogProvider

