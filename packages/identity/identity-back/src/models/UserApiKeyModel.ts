import {mongoose, MongooseSoftDelete} from '@drax/common-back';
import {IUserApiKey} from "@drax/identity-share";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import {PaginateModel} from "mongoose";

// Defining user Mongoose Schema
const UserApiKeyMongoSchema = new mongoose.Schema<IUserApiKey>({
    name: {
        type: String,
        unique: false,
        required: true,
        index: false,
    },
    secret: {
        type: String,
        unique: false,
        required: true,
        index: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    ipv4: [{
        type: String,
        unique: false,
        required: false,
        index: false,
    }],
    ipv6: [{
        type: String,
        unique: false,
        required: false,
        index: false,
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {timestamps: true});

UserApiKeyMongoSchema.set('toJSON', {getters: true});

UserApiKeyMongoSchema.plugin(uniqueValidator, {message: 'validation.unique'});

UserApiKeyMongoSchema.plugin(MongooseSoftDelete);
UserApiKeyMongoSchema.plugin(mongoosePaginate);

const MODEL_NAME = 'UserApiKey';
const COLLECTION_NAME = 'userApiKeys';

const UserApiKeyModel = mongoose.model<IUserApiKey,PaginateModel<IUserApiKey>>(MODEL_NAME, UserApiKeyMongoSchema,COLLECTION_NAME);


export {
    UserApiKeyMongoSchema,
    UserApiKeyModel
}

export default UserApiKeyModel

