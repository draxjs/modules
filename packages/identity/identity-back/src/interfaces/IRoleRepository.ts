import {IRole, IRoleBase} from "@drax/identity-share";
import {IDraxCrudRepository} from "@drax/crud-share";

interface IRoleRepository extends IDraxCrudRepository<IRole, IRoleBase, IRoleBase> {
    findById(id: string): Promise<IRole | null>;
    findByName(name: string): Promise<IRole | null>;
    fetchAll(): Promise<IRole[]>;
}

export {IRoleRepository}
