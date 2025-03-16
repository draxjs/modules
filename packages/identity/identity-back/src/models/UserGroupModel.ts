import {mongoose, MongooseSoftDelete} from '@drax/common-back';
import {IUserGroup} from "@drax/identity-share";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import {PaginateModel} from "mongoose";


// Defining user Mongoose Schema
const UserGroupMongoSchema = new mongoose.Schema<IUserGroup>({
    name: {
        type: String,
        unique: true,
        required: true,
        index: true,
        validate: {
            validator: function (value: string) {
                let r = /^[a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*$/;
                return r.test(value);
            },
            message: "Invalid name format"
        }
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    }],
}, {timestamps: true});

UserGroupMongoSchema.set('toJSON', {getters: true});

UserGroupMongoSchema.plugin(uniqueValidator, {message: 'validation.unique'});

UserGroupMongoSchema.plugin(MongooseSoftDelete);
UserGroupMongoSchema.plugin(mongoosePaginate);

const USERGROUP_MODEL_NAME = 'UserGroup';
const USERGROUP_COLLECTION_NAME = 'userGroups';

const UserGroupModel = mongoose.model<IUserGroup,PaginateModel<IUserGroup>>(USERGROUP_MODEL_NAME, UserGroupMongoSchema,USERGROUP_COLLECTION_NAME);

export {
    UserGroupMongoSchema,
    UserGroupModel
}

export default UserGroupModel

