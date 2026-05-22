import TTSVoiceMongoRepository from '../../repository/mongo/TTSVoiceMongoRepository.js'
import TTSVoiceSqliteRepository from '../../repository/sqlite/TTSVoiceSqliteRepository.js'
import type {ITTSVoiceRepository} from "../../interfaces/ITTSVoiceRepository";
import {TTSVoiceService} from '../../services/TTSVoiceService.js'
import {TTSVoiceBaseSchema, TTSVoiceSchema} from "../../schemas/TTSVoiceSchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class TTSVoiceServiceFactory {
    private static service: TTSVoiceService;

    public static get instance(): TTSVoiceService {
        if (!TTSVoiceServiceFactory.service) {
            let repository: ITTSVoiceRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new TTSVoiceMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new TTSVoiceSqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }

            TTSVoiceServiceFactory.service = new TTSVoiceService(repository, TTSVoiceBaseSchema, TTSVoiceSchema);
        }
        return TTSVoiceServiceFactory.service;
    }
}

export default TTSVoiceServiceFactory
export {
    TTSVoiceServiceFactory
}
