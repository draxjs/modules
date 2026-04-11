
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {INotification} from '../interfaces/INotification'

const NotificationSchema = new mongoose.Schema<INotification>({
            title: {type: String,   required: true, index: true, unique: false },
            message: {type: String,   required: true, index: false, unique: false },
            type: {type: String,  enum: ['info', 'success', 'warning', 'error'], required: true, index: true, unique: false },
            status: {type: String,  enum: ['unread', 'read'], required: true, index: true, unique: false },
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true, unique: false },
            metadata: {type: mongoose.Schema.Types.Mixed,   required: false, index: false, unique: false },
            readAt: {type: Date,   required: false, index: false, unique: false }
}, {timestamps: true});

NotificationSchema.plugin(uniqueValidator, {message: 'validation.unique'});
NotificationSchema.plugin(mongoosePaginate);

NotificationSchema.virtual("id").get(function () {
    return this._id.toString();
});


NotificationSchema.set('toJSON', {getters: true, virtuals: true});

NotificationSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Notification';
const COLLECTION_NAME = 'Notification';
const NotificationModel = mongoose.model<INotification, PaginateModel<INotification>>(MODEL_NAME, NotificationSchema,COLLECTION_NAME);

export {
    NotificationSchema,
    NotificationModel
}

export default NotificationModel
