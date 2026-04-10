import {mongoose} from "@drax/common-back";
import {PaginateModel} from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import mongoosePaginate from "mongoose-paginate-v2";
import type {IUserPasswordHistory} from "../interfaces/IUserPasswordHistory.js";

const UserPasswordHistoryMongoSchema = new mongoose.Schema<IUserPasswordHistory>({
    user: {type: String, required: true, index: true},
    passwordHash: {type: String, required: true, index: false}
}, {timestamps: true});

UserPasswordHistoryMongoSchema.plugin(uniqueValidator, {message: "validation.unique"});
UserPasswordHistoryMongoSchema.plugin(mongoosePaginate);

UserPasswordHistoryMongoSchema.virtual("id").get(function () {
    return this._id.toString();
});

UserPasswordHistoryMongoSchema.set("toJSON", {getters: true, virtuals: true});
UserPasswordHistoryMongoSchema.set("toObject", {getters: true, virtuals: true});

const MODEL_NAME = "UserPasswordHistory";
const COLLECTION_NAME = "user_password_history";

let UserPasswordHistoryModel;

try {
    UserPasswordHistoryModel = mongoose.model<IUserPasswordHistory, PaginateModel<IUserPasswordHistory>>(MODEL_NAME, UserPasswordHistoryMongoSchema, COLLECTION_NAME);
} catch (e) {
    if (e.name === "OverwriteModelError") {
        UserPasswordHistoryModel = mongoose.model<IUserPasswordHistory, PaginateModel<IUserPasswordHistory>>(MODEL_NAME);
    } else {
        throw e;
    }
}

export {
    UserPasswordHistoryMongoSchema,
    UserPasswordHistoryModel
}

export default UserPasswordHistoryModel
