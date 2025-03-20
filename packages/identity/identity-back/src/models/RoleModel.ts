import {mongoose, MongooseSoftDelete} from '@drax/common-back';
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import {IRole} from '@drax/identity-share'
const Schema = mongoose.Schema
import {PaginateModel} from "mongoose";


const RoleMongoSchema = new Schema<IRole>({
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
}, {timestamps: true, toJSON: {  virtuals: true}, toObject: {virtuals: true} } );

RoleMongoSchema.virtual("id").get(function () {
    return this._id.toString();
});


RoleMongoSchema.plugin(uniqueValidator, {message: 'validation.unique'});
RoleMongoSchema.plugin(MongooseSoftDelete);
RoleMongoSchema.plugin(mongoosePaginate);


RoleMongoSchema.set('toJSON', {getters: true, virtuals: true});

const ROLE_MODEL_NAME = 'Role';
const ROLE_COLLECTION_NAME = 'roles';
const RoleModel = mongoose.model<IRole, PaginateModel<IRole>>(ROLE_MODEL_NAME, RoleMongoSchema,ROLE_COLLECTION_NAME);

export {
    RoleMongoSchema,
    RoleModel
}

export default RoleModel

