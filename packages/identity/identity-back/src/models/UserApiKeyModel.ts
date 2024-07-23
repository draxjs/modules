import {mongoose, MongooseSoftDelete} from '@drax/common-back';
import {IUserApiKey} from "@drax/identity-share";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import {PaginateModel} from "mongoose";

// Defining user Mongoose Schema
const UserApiKeySchema = new mongoose.Schema<IUserApiKey>({
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
}, {timestamps: true});

UserApiKeySchema.set('toJSON', {getters: true});

UserApiKeySchema.plugin(uniqueValidator, {message: 'validation.unique'});

UserApiKeySchema.plugin(MongooseSoftDelete);
UserApiKeySchema.plugin(mongoosePaginate);

const MODEL_NAME = 'UserApiKey';
const COLLECTION_NAME = 'userApiKeys';

const UserApiKeyModel = mongoose.model<IUserApiKey,PaginateModel<IUserApiKey>>(MODEL_NAME, UserApiKeySchema,COLLECTION_NAME);


export {
    UserApiKeySchema,
    UserApiKeyModel
}

export default UserApiKeyModel

