/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/aggregate.js" />
/// <reference types="mongoose/types/callback.js" />
/// <reference types="mongoose/types/collection.js" />
/// <reference types="mongoose/types/connection.js" />
/// <reference types="mongoose/types/cursor.js" />
/// <reference types="mongoose/types/document.js" />
/// <reference types="mongoose/types/error.js" />
/// <reference types="mongoose/types/expressions.js" />
/// <reference types="mongoose/types/helpers.js" />
/// <reference types="mongoose/types/middlewares.js" />
/// <reference types="mongoose/types/indexes.js" />
/// <reference types="mongoose/types/models.js" />
/// <reference types="mongoose/types/mongooseoptions.js" />
/// <reference types="mongoose/types/pipelinestage.js" />
/// <reference types="mongoose/types/populate.js" />
/// <reference types="mongoose/types/query.js" />
/// <reference types="mongoose/types/schemaoptions.js" />
/// <reference types="mongoose/types/schematypes.js" />
/// <reference types="mongoose/types/session.js" />
/// <reference types="mongoose/types/types.js" />
/// <reference types="mongoose/types/utility.js" />
/// <reference types="mongoose/types/validation.js" />
/// <reference types="mongoose/types/virtuals.js" />
/// <reference types="mongoose/types/inferschematype.js" />
/// <reference types="mongoose-paginate-v2" />
import { mongoose } from "@drax/common-back";
import { FilterQuery, PaginateOptions, PaginateResult } from "mongoose";
import { IUser } from "../interfaces/IUser";
declare class UserRepository {
    create(userData: IUser): Promise<IUser>;
    update(_id: mongoose.Types.ObjectId, userData: IUser): Promise<IUser>;
    delete(_id: mongoose.Types.ObjectId): Promise<boolean>;
    findById(_id: mongoose.Types.ObjectId): Promise<IUser>;
    findByUsername(username: string): Promise<IUser>;
    paginate(query?: FilterQuery<IUser>, options?: PaginateOptions): Promise<PaginateResult<IUser>>;
}
export default UserRepository;
//# sourceMappingURL=UserRepository.d.ts.map