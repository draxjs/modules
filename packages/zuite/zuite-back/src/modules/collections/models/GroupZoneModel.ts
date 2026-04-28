
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IGroupZone} from '../interfaces/IGroupZone'

const GroupZoneSchema = new mongoose.Schema<IGroupZone>({
            name: {type: String,   required: true, index: true, unique: true },
            users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: false, index: false, unique: false }]
}, {timestamps: true});

GroupZoneSchema.plugin(uniqueValidator, {message: 'validation.unique'});
GroupZoneSchema.plugin(mongoosePaginate);

GroupZoneSchema.virtual("id").get(function () {
    return this._id.toString();
});


GroupZoneSchema.set('toJSON', {getters: true, virtuals: true});

GroupZoneSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'GroupZone';
const COLLECTION_NAME = 'groups';
const GroupZoneModel = mongoose.model<IGroupZone, PaginateModel<IGroupZone>>(MODEL_NAME, GroupZoneSchema,COLLECTION_NAME);

export {
    GroupZoneSchema,
    GroupZoneModel
}

export default GroupZoneModel
