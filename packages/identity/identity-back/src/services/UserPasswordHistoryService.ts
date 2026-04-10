import type {IUserPasswordHistoryRepository} from "../interfaces/IUserPasswordHistoryRepository.js";
import type {IUserPasswordHistory} from "../interfaces/IUserPasswordHistory.js";

class UserPasswordHistoryService {
    constructor(private readonly repository: IUserPasswordHistoryRepository) {
    }

    async create(userId: string, passwordHash: string): Promise<IUserPasswordHistory> {
        return this.repository.create({
            user: userId,
            passwordHash
        })
    }

    async findLatestByUserId(userId: string, limit: number): Promise<IUserPasswordHistory[]> {
        if (limit <= 0) {
            return []
        }
        return this.repository.findLatestByUserId(userId, limit)
    }
}

export default UserPasswordHistoryService
