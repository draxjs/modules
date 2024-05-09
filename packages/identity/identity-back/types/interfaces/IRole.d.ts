/// <reference types="mongoose/types/types" />
import { mongoose } from "@drax/common-back";
interface IRole {
    _id?: mongoose.Types.ObjectId;
    name: string;
    permissions: string[];
    childRoles?: mongoose.Types.ObjectId[];
    readonly: boolean;
}
export { IRole };
//# sourceMappingURL=IRole.d.ts.map