import PasswordPolicyService from "../services/PasswordPolicyService.js";
import PasswordPolicyResolverFactory from "./PasswordPolicyResolverFactory.js";
import UserPasswordHistoryServiceFactory from "./UserPasswordHistoryServiceFactory.js";
import UserMongoRepository from "../repository/mongo/UserMongoRepository.js";
import UserSqliteRepository from "../repository/sqlite/UserSqliteRepository.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";
import type {IUserRepository} from "../interfaces/IUserRepository.js";

let passwordPolicyService: PasswordPolicyService

const PasswordPolicyServiceFactory = (verbose: boolean = false): PasswordPolicyService => {
    if (!passwordPolicyService) {
        let userRepository: IUserRepository

        switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
            case COMMON.DB_ENGINES.MONGODB:
                userRepository = new UserMongoRepository()
                break;
            case COMMON.DB_ENGINES.SQLITE:
                userRepository = new UserSqliteRepository(DraxConfig.getOrLoad(CommonConfig.SqliteDbFile), verbose)
                userRepository.build()
                break;
            default:
                throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
        }

        const passwordPolicyResolver = PasswordPolicyResolverFactory()
        passwordPolicyService = new PasswordPolicyService(
            passwordPolicyResolver,
            userRepository,
            UserPasswordHistoryServiceFactory(verbose)
        )
    }

    return passwordPolicyService
}

export default PasswordPolicyServiceFactory
