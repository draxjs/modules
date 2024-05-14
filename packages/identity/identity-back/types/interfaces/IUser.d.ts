/// <reference types="mongoose/types/types" />
import { mongoose } from "@drax/common-back";
import { IRole } from "./IRole";
import { IUserGroup } from "./IUserGroup";
interface IUser {
    _id?: mongoose.Types.ObjectId;
    username: string;
    email: string;
    password: string;
    active: boolean;
    name?: string;
    phone?: string;
    avatar?: string;
    avatarurl?: string;
    code?: string;
    role: mongoose.Types.ObjectId | IRole;
    groups: mongoose.Types.ObjectId[] | IUserGroup[];
    toObject(): IUser;
}
export { IUser };
//# sourceMappingURL=IUser.d.ts.map