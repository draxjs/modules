import {mongoose, MongooseSoftDelete} from '@drax/common-back';
import {IUser} from "@drax/identity-share";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import {PaginateModel} from "mongoose";


// Defining user Mongoose Schema
const UserMongoSchema = new mongoose.Schema<IUser>({
    username: {
        type: String,
        unique: true,
        required: true,
        index: true,
        validate: {
            validator: function (value: string) {
                let r = /^[a-zA-Z0-9]+$/;
                return r.test(value);
            },
            message: "Invalid username format"
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        index: true,
        validate: {
            validator: function (value: string) {
                let r = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
                return r.test(value);
            },
            message: "Invalid email format"
        }
    },
    password: {type: String, required: true,  index: false, select: false},
    name: {type: String, required: false,  index: false},
    active: {type: Boolean, required: true, default: false,  index: false},
    phone: {
        type: String,
        required: false,
        index: false,
        validate: {
            validator: function (value: string) {
                let r = /[0-9]+/;
                return value ? r.test(value) : true;
            },
            message: "Invalid Phone format"
        }
    },
    avatar: {type: String, required: false, index:false},

    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true,
        index: false
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: false,
        index: false
    },
    origin: {type: String, required: false, index:false},
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: false,
        index: false
    }],
    emailVerified: {type: Boolean, required: true, default: false,  index: false},
    phoneVerified: {type: Boolean, required: true, default: false,  index: false},
    emailCode: {type: String, required: false, index: false, select: false},
    phoneCode: {type: String, required: false, index: false, select: false},
    recoveryCode: {type: String, required: false, index: false, select: false},
}, {timestamps: true, toJSON: {  virtuals: true}, toObject: { virtuals: true} });

UserMongoSchema.virtual("id").get(function () {
    return this._id.toString();
});

UserMongoSchema.plugin(uniqueValidator, {message: 'validation.unique'});

UserMongoSchema.plugin(MongooseSoftDelete);
UserMongoSchema.plugin(mongoosePaginate);

const USER_MODEL_NAME = 'User';
const USER_COLLECTION_NAME = 'users';

const UserModel = mongoose.models.User as mongoose.Model<IUser> & PaginateModel<IUser> ||  mongoose.model<IUser,PaginateModel<IUser>>(USER_MODEL_NAME, UserMongoSchema,USER_COLLECTION_NAME);

export {
    UserMongoSchema,
    UserModel
}

export default UserModel

