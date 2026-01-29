
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IUserSession} from '@drax/identity-share'

const UserSessionMongoSchema = new mongoose.Schema<IUserSession>({
            uuid: {type: String,   required: true, index: true, unique: false },
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true, unique: false },
            userAgent: {type: String,   required: false, index: false, unique: false },
            ip: {type: String,   required: false, index: false, unique: false },
}, {timestamps: true});

UserSessionMongoSchema.plugin(uniqueValidator, {message: 'validation.unique'});
UserSessionMongoSchema.plugin(mongoosePaginate);

UserSessionMongoSchema.virtual("id").get(function () {
    return this._id.toString();
});


UserSessionMongoSchema.set('toJSON', {getters: true, virtuals: true});

UserSessionMongoSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'UserSession';
const COLLECTION_NAME = 'UserSession';

let UserSessionModel;

try {
    UserSessionModel = mongoose.model<IUserSession, PaginateModel<IUserSession>>(MODEL_NAME, UserSessionMongoSchema,COLLECTION_NAME);
} catch (e) {
    if (e.name === 'OverwriteModelError') {
        UserSessionModel = mongoose.model<IUserSession, PaginateModel<IUserSession>>(MODEL_NAME);
    } else {
        throw e;
    }
}


export {
    UserSessionMongoSchema,
    UserSessionModel
}

export default UserSessionModel
