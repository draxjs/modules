
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IUserSession} from '../interfaces/IUserSession'

const UserSessionSchema = new mongoose.Schema<IUserSession>({
            uuid: {type: String,   required: true, index: true, unique: false },
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true, unique: false },
            agent: {type: String,   required: false, index: false, unique: false },
            ip: {type: String,   required: false, index: false, unique: false },
            createdAt: {type: Date,   required: false, index: false, unique: false }
}, {timestamps: true});

UserSessionSchema.plugin(uniqueValidator, {message: 'validation.unique'});
UserSessionSchema.plugin(mongoosePaginate);

UserSessionSchema.virtual("id").get(function () {
    return this._id.toString();
});


UserSessionSchema.set('toJSON', {getters: true, virtuals: true});

UserSessionSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'UserSession';
const COLLECTION_NAME = 'UserSession';
const UserSessionModel = mongoose.model<IUserSession, PaginateModel<IUserSession>>(MODEL_NAME, UserSessionSchema,COLLECTION_NAME);

export {
    UserSessionSchema,
    UserSessionModel
}

export default UserSessionModel
