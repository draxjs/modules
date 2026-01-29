import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IUserLoginFail} from '@drax/identity-share'

const UserLoginFailMongoSchema = new mongoose.Schema<IUserLoginFail>({
            username: {type: String,   required: false, index: false, unique: false },
            userAgent: {type: String,   required: false, index: false, unique: false },
            ip: {type: String,   required: false, index: false, unique: false },
}, {timestamps: true});

UserLoginFailMongoSchema.plugin(uniqueValidator, {message: 'validation.unique'});
UserLoginFailMongoSchema.plugin(mongoosePaginate);

UserLoginFailMongoSchema.virtual("id").get(function () {
    return this._id.toString();
});


UserLoginFailMongoSchema.set('toJSON', {getters: true, virtuals: true});

UserLoginFailMongoSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'UserLoginFail';
const COLLECTION_NAME = 'UserLoginFail';

let UserLoginFailModel;

try {
    UserLoginFailModel = mongoose.model<IUserLoginFail, PaginateModel<IUserLoginFail>>(MODEL_NAME, UserLoginFailMongoSchema, COLLECTION_NAME);
} catch (e) {
    if (e.name === 'OverwriteModelError') {
        UserLoginFailModel = mongoose.model<IUserLoginFail, PaginateModel<IUserLoginFail>>(MODEL_NAME);
    } else {
        throw e;
    }
}



export {
    UserLoginFailMongoSchema,
    UserLoginFailModel
}

export default UserLoginFailModel
