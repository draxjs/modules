import {COMMON, CommonConfig, DraxConfig} from '@drax/common-back';
import type {IUserRepository} from '../interfaces/IUserRepository.js';
import type {IRefreshTokenRepository} from '../interfaces/IRefreshTokenRepository.js';
import RefreshTokenMongoRepository from '../repository/mongo/RefreshTokenMongoRepository.js';
import RefreshTokenSqliteRepository from '../repository/sqlite/RefreshTokenSqliteRepository.js';
import RefreshTokenService from '../services/RefreshTokenService.js';

export default function RefreshTokenServiceFactory(users: IUserRepository): RefreshTokenService {
    let repository: IRefreshTokenRepository;
    switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
        case COMMON.DB_ENGINES.MONGODB:
            repository = new RefreshTokenMongoRepository();
            break;
        case COMMON.DB_ENGINES.SQLITE:
            repository = new RefreshTokenSqliteRepository(DraxConfig.getOrLoad(CommonConfig.SqliteDbFile));
            break;
        default:
            throw new Error('Unsupported DB engine for refresh tokens');
    }
    return new RefreshTokenService(repository, users);
}
