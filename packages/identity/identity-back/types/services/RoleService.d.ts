import { IRole } from "../interfaces/IRole";
import { IRoleRepository } from "../interfaces/IRoleRepository";
import { IPaginateFilter } from "@drax/common-back";
declare class RoleService {
    _repository: IRoleRepository;
    constructor(roleRepostitory: IRoleRepository);
    create(roleData: IRole): Promise<IRole>;
    update(_id: any, roleData: IRole): Promise<IRole>;
    delete(_id: any): Promise<boolean>;
    findById(_id: any): Promise<IRole | null>;
    paginate(filters?: IPaginateFilter, page?: number, limit?: number): Promise<{
        roles: IRole[];
        totalCount: number;
    }>;
}
export default RoleService;
//# sourceMappingURL=RoleService.d.ts.map