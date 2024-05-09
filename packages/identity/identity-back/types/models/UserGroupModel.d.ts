/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/utility" />
import { mongoose } from '@drax/common-back';
import { IUserGroup } from "../interfaces/IUserGroup";
declare const UserGroupSchema: mongoose.Schema<IUserGroup, mongoose.Model<IUserGroup, any, any, any, mongoose.Document<unknown, any, IUserGroup> & IUserGroup & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, IUserGroup, mongoose.Document<unknown, {}, mongoose.FlatRecord<IUserGroup>> & mongoose.FlatRecord<IUserGroup> & Required<{
    _id: mongoose.Types.ObjectId;
}>>;
declare const UserGroupModel: mongoose.PaginateModel<IUserGroup, {}, {}>;
export { UserGroupSchema, UserGroupModel };
export default UserGroupModel;
//# sourceMappingURL=UserGroupModel.d.ts.map