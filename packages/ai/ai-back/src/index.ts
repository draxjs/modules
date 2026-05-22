import {OpenAiConfig} from "./config/OpenAiConfig.js";
import {GoogleAiConfig} from "./config/GoogleAiConfig.js";
import {OllamaAiConfig} from "./config/OllamaAiConfig.js";
import {DeepSeekConfig} from "./config/DeepSeekConfig.js";
import {ElevenLabsTTSConfig} from "./config/ElevenLabsTTSConfig.js";
import {AILogSchema, AILogBaseSchema} from "./schemas/AILogSchema.js";
import {TTSRequestSchema, TTSVoiceSettingsSchema} from "./schemas/TTSRequestSchema.js";
import AILogModel from "./models/AILogModel.js";
import AILogMongoRepository from "./repository/mongo/AILogMongoRepository.js";
import AILogSqliteRepository from "./repository/sqlite/AILogSqliteRepository.js";
import {OpenAiProviderFactory} from "./factory/ai/OpenAiProviderFactory.js";
import {GoogleAiProviderFactory} from "./factory/ai/GoogleAiProviderFactory.js";
import {OllamaAiProviderFactory} from "./factory/ai/OllamaAiProviderFactory.js";
import {DeepSeekAiProviderFactory} from "./factory/ai/DeepSeekAiProviderFactory.js";
import {AiProviderFactory} from "./factory/ai/AiProviderFactory.js";
import {ElevenLabsTTSProviderFactory} from "./factory/tts/ElevenLabsTTSProviderFactory.js";
import {TTSProviderFactory} from "./factory/tts/TTSProviderFactory.js";
import type {TTSProviderInfo} from "./factory/tts/TTSProviderFactory.js";
import {DraxAgentFactory} from "./factory/DraxAgentFactory.js";
import AILogServiceFactory from "./factory/services/AILogServiceFactory.js";
import {OpenAiProvider} from "./providers/ai/OpenAiProvider.js";
import {GoogleAiProvider} from "./providers/ai/GoogleAiProvider.js";
import {OllamaAiProvider} from "./providers/ai/OllamaAiProvider.js";
import {DeepSeekAiProvider} from "./providers/ai/DeepSeekAiProvider.js";
import {ElevenLabsTTSProvider} from "./providers/tts/ElevenLabsTTSProvider.js";
import {BuilderTool} from "./tools/BuilderTool.js";
import {KnowledgeService} from "./services/KnowledgeService.js";
import {AILogService} from "./services/AILogService.js";
import {TTSGenericService} from "./services/TTSGenericService.js";
import {PromptAudioService} from "./services/PromptAudioService.js";
import AILogPermissions from "./permissions/AILogPermissions.js";
import AgentPermissions from "./permissions/AgentPermissions.js";
import AgentSessionPermissions from "./permissions/AgentSessionPermissions.js";
import AIPermissions from "./permissions/AIPermissions.js";
import TTSPermissions from "./permissions/TTSPermissions.js";
import AILogController from "./controllers/AILogController.js";
import AICrudController from "./controllers/AICrudController.js";
import AIGenericController from "./controllers/AIGenericController.js";
import TTSGenericController from "./controllers/TTSGenericController.js";
import DraxAgentController from "./controllers/DraxAgentController.js";
import AgentSessionController from "./controllers/AgentSessionController.js";
import AILogRoutes from "./routes/AILogRoutes.js";
import AIRoutes from "./routes/AIRoutes.js";
import TTSRoutes from "./routes/TTSRoutes.js";
import DraxAgentRoutes from "./routes/DraxAgentRoutes.js";
import AgentSessionRoutes from "./routes/AgentSessionRoutes.js";
import {DraxAgent} from "./agents/DraxAgent.js";
import type {IAILogRepository} from "./interfaces/IAILogRepository.js";
import type {
    IAIProvider,
    IPromptContentPart,
    IPromptContentPartImage,
    IPromptContentPartText,
    IPromptAudioParams,
    IPromptAudioResponse,
    IPromptAudioResponseMeta,
    IPromptImage,
    IPromptImageDetail,
    IPromptMessage,
    IPromptMemory,
    IPromptParams,
    IPromptResponse,
    IPromptTool
} from "./interfaces/IAIProvider.js";
import type {
    ITTSParams,
    ITTSProvider,
    ITTSResponse,
    ITTSVoiceSettings,
} from "./interfaces/ITTSProvider.js";
import type {
    TTSRequest,
    TTSVoiceSettings,
} from "./schemas/TTSRequestSchema.js";
import type {
    TTSRequestContext,
} from "./services/TTSGenericService.js";
import type {
    ToolBuilderMethod,
    ToolBuilderOptions,
    ToolBuilderService
} from "./interfaces/IBuilderTool.js";
import type {
    DraxAgentControllerOptions
} from "./interfaces/IDraxAgentController.js";
import type {
    DraxAgentFastifyRoutesOptions
} from "./interfaces/IDraxAgentRoutes.js";
import type {
    DraxAgentConfig,
    DraxAgentMessageInput,
    DraxAgentMessageOutput,
    DraxAgentPromptContext,
    DraxAgentSession,
    DraxAgentSessionInput,
    DraxAgentToolBuilder,
    DraxAgentToolBuilderSource,
    DraxAgentToolSource,
    DraxAgentSystemPrompt,
} from "./interfaces/IDraxAgent.js";

export type {

    IAILogRepository,
    IAIProvider,
    IPromptParams,
    IPromptMessage,
    IPromptMemory,
    IPromptTool,
    IPromptImage,
    IPromptImageDetail,
    IPromptContentPart,
    IPromptContentPartImage,
    IPromptContentPartText,
    IPromptAudioParams,
    IPromptAudioResponse,
    IPromptAudioResponseMeta,
    IPromptResponse,
    ITTSProvider,
    ITTSParams,
    ITTSResponse,
    ITTSVoiceSettings,
    TTSRequest,
    TTSVoiceSettings,
    TTSRequestContext,
    TTSProviderInfo,
    ToolBuilderMethod,
    ToolBuilderOptions,
    ToolBuilderService,
    DraxAgentControllerOptions,
    DraxAgentFastifyRoutesOptions,
    DraxAgentConfig,
    DraxAgentMessageInput,
    DraxAgentMessageOutput,
    DraxAgentPromptContext,
    DraxAgentSession,
    DraxAgentSessionInput,
    DraxAgentToolBuilder,
    DraxAgentToolBuilderSource,
    DraxAgentToolSource,
    DraxAgentSystemPrompt,
}

export {
    OpenAiConfig,
    GoogleAiConfig,
    OllamaAiConfig,
    DeepSeekConfig,
    ElevenLabsTTSConfig,
    AILogSchema,
    AILogBaseSchema,
    TTSRequestSchema,
    TTSVoiceSettingsSchema,
    AILogModel,
    AILogMongoRepository,
    AILogSqliteRepository,
    OpenAiProviderFactory,
    GoogleAiProviderFactory,
    OllamaAiProviderFactory,
    DeepSeekAiProviderFactory,
    AiProviderFactory,
    ElevenLabsTTSProviderFactory,
    TTSProviderFactory,
    DraxAgentFactory,
    AILogServiceFactory,
    OpenAiProvider,
    GoogleAiProvider,
    OllamaAiProvider,
    DeepSeekAiProvider,
    ElevenLabsTTSProvider,
    BuilderTool,
    //Service
    KnowledgeService,
    AILogService,
    TTSGenericService,
    PromptAudioService,
    //Permissions
    AILogPermissions,
    AgentPermissions,
    AIPermissions,
    TTSPermissions,
    AgentSessionPermissions,
    //Controllers
    AILogController,
    AICrudController,
    AIGenericController,
    TTSGenericController,
    DraxAgentController,
    AgentSessionController,
    DraxAgent,
    AILogRoutes,
    AIRoutes,
    TTSRoutes,
    DraxAgentRoutes,
    AgentSessionRoutes
}
