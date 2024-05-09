/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/utility" />
import { mongoose } from '@drax/common-back';
import { IRole } from '../interfaces/IRole';
declare const RoleSchema: mongoose.Schema<IRole, mongoose.Model<IRole, any, any, any, mongoose.Document<unknown, any, IRole> & IRole & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, IRole, mongoose.Document<unknown, {}, mongoose.FlatRecord<IRole>> & mongoose.FlatRecord<IRole> & Required<{
    _id: mongoose.Types.ObjectId;
}>>;
declare const RoleModel: mongoose.PaginateModel<IRole, {}, {}>;
export { RoleSchema, RoleModel };
export default RoleModel;
//# sourceMappingURL=RoleModel.d.ts.map