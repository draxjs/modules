import type {IUserPasswordHistory, IUserPasswordHistoryCreate} from "./IUserPasswordHistory.js";

interface IUserPasswordHistoryRepository {
    create(data: IUserPasswordHistoryCreate): Promise<IUserPasswordHistory>
    findLatestByUserId(userId: string, limit: number): Promise<IUserPasswordHistory[]>
}

export type {IUserPasswordHistoryRepository}
