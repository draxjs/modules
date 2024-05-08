import {mongoose, MongooseSoftDelete} from '@drax/common-back';
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import {IRole} from '../interfaces/IRole'
const Schema = mongoose.Schema
import {PaginateModel} from "mongoose";


const RoleSchema = new Schema<IRole>({
    name: {
        type: String, unique: true, required: true, index: true,
        validate: [
            {
                validator: function(v) {
                    return !/(\s){2}/.test(v);
                },
                message: props => `Role name cant contain two spaces`
            },

        ],
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

const ROLES_COLLECTION_NAME = 'roles';
const RoleModel = mongoose.model<IRole, PaginateModel<IRole>>(ROLES_COLLECTION_NAME, RoleSchema,ROLES_COLLECTION_NAME);

export {
    RoleSchema,
    RoleModel
}

export default RoleModel

