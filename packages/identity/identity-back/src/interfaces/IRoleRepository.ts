import {IRole, IRoleBase} from "@drax/identity-share";
import {IDraxCrud} from "@drax/common-share";

interface IRoleRepository extends IDraxCrud<IRole, IRoleBase, IRoleBase> {
    findById(id: string): Promise<IRole | null>;
    findByName(name: string): Promise<IRole | null>;
    fetchAll(): Promise<IRole[]>;
}

export {IRoleRepository}
