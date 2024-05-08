import {mongoose, MongooseSoftDelete} from '@drax/common-back';
import {IUser} from "../interfaces/IUser";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import {PaginateModel} from "mongoose";


// Defining user Mongoose Schema
const UserSchema = new mongoose.Schema<IUser>({
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
    password: {type: String, required: true},
    code: {type: String, required: false},
    name: {type: String, required: false},
    active: {type: Boolean, required: true, default: false},
    phone: {
        type: String,
        required: false,
        validate: {
            validator: function (value: string) {
                let r = /[0-9]+/;
                return value ? r.test(value) : true;
            },
            message: "Invalid Phone format"
        }
    },
    avatar: {type: String, required: false},
    avatarurl: {type: String, required: false},
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true,
    },
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: false,
    }],
  /*  refreshToken: {
        type: [
            {
                id: {type: String},
                expiryDate: {type: Date},
                sessionId: {type: String},
            }
        ],
        default: [],
        _id: false
    }*/
}, {timestamps: true});

UserSchema.set('toJSON', {getters: true});

UserSchema.plugin(uniqueValidator, {message: 'validation.unique'});

UserSchema.plugin(MongooseSoftDelete);
UserSchema.plugin(mongoosePaginate);

const USERS_COLLECTION_NAME = 'users';

const UserModel = mongoose.model<IUser,PaginateModel<IUser>>(USERS_COLLECTION_NAME, UserSchema,USERS_COLLECTION_NAME);

export {
    UserSchema,
    UserModel
}

export default UserModel

