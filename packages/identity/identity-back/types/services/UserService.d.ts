import { IPaginateFilter } from "@drax/common-back";
import { IUser } from "../interfaces/IUser";
import { IUserRepository } from "../interfaces/IUserRepository";
declare class UserService {
    _repository: IUserRepository;
    constructor(userRepository: IUserRepository);
    create(userData: IUser): Promise<IUser>;
    update(_id: any, userData: IUser): Promise<IUser>;
    delete(_id: any): Promise<boolean>;
    findById(_id: any): Promise<IUser | null>;
    findByUsername(username: string): Promise<IUser | null>;
    paginate(filters?: IPaginateFilter, page?: number, limit?: number): Promise<{
        roles: IUser[];
        totalCount: number;
    }>;
}
export default UserService;
//# sourceMappingURL=UserService.d.ts.map