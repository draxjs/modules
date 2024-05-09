/// <reference types="mongoose/types/types" />
import { mongoose } from "@drax/common-back";
import { IUser } from "./IUser";
interface IUserGroup {
    _id?: mongoose.Types.ObjectId;
    name: string;
    users: mongoose.Types.ObjectId[] | IUser[];
}
export { IUserGroup };
//# sourceMappingURL=IUserGroup.d.ts.map