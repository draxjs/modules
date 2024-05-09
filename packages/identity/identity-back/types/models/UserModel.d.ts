/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/utility" />
import { mongoose } from '@drax/common-back';
import { IUser } from "../interfaces/IUser";
declare const UserSchema: mongoose.Schema<IUser, mongoose.Model<IUser, any, any, any, mongoose.Document<unknown, any, IUser> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, IUser, mongoose.Document<unknown, {}, mongoose.FlatRecord<IUser>> & mongoose.FlatRecord<IUser> & Required<{
    _id: mongoose.Types.ObjectId;
}>>;
declare const UserModel: mongoose.PaginateModel<IUser, {}, {}>;
export { UserSchema, UserModel };
export default UserModel;
//# sourceMappingURL=UserModel.d.ts.map