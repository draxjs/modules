import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IUserLoginFail} from '@drax/identity-share'

const UserLoginFailSchema = new mongoose.Schema<IUserLoginFail>({
            username: {type: String,   required: false, index: false, unique: false },
            userAgent: {type: String,   required: false, index: false, unique: false },
            ip: {type: String,   required: false, index: false, unique: false },
}, {timestamps: true});

UserLoginFailSchema.plugin(uniqueValidator, {message: 'validation.unique'});
UserLoginFailSchema.plugin(mongoosePaginate);

UserLoginFailSchema.virtual("id").get(function () {
    return this._id.toString();
});


UserLoginFailSchema.set('toJSON', {getters: true, virtuals: true});

UserLoginFailSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'UserLoginFail';
const COLLECTION_NAME = 'UserLoginFail';
const UserLoginFailModel = mongoose.model<IUserLoginFail, PaginateModel<IUserLoginFail>>(MODEL_NAME, UserLoginFailSchema,COLLECTION_NAME);

export {
    UserLoginFailSchema,
    UserLoginFailModel
}

export default UserLoginFailModel
