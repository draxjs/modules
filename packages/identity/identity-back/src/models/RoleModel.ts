import {mongoose, MongooseSoftDelete} from '@drax/common-back';
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import {IRole} from '@drax/identity-share'
const Schema = mongoose.Schema
import {PaginateModel} from "mongoose";


const RoleSchema = new Schema<IRole>({
    name: {
        type: String, unique: true, required: true, index: true,
    },
    permissions: [{type: String, required: true}],
    childRoles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: false,
    }],
    readonly: {type: Boolean, required: false, default: false},
});

RoleSchema.plugin(uniqueValidator, {message: 'validation.unique'});
RoleSchema.plugin(MongooseSoftDelete);
RoleSchema.plugin(mongoosePaginate);


RoleSchema.set('toJSON', {getters: true});

const ROLE_MODEL_NAME = 'Role';
const ROLE_COLLECTION_NAME = 'roles';
const RoleModel = mongoose.model<IRole, PaginateModel<IRole>>(ROLE_MODEL_NAME, RoleSchema,ROLE_COLLECTION_NAME);

export {
    RoleSchema,
    RoleModel
}

export default RoleModel

