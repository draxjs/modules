
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ICovenant} from '../interfaces/ICovenant'

const CovenantSchema = new mongoose.Schema<ICovenant>({
            date: {type: Date,   required: true, index: false, unique: false },
            link: {type: String,   required: false, index: false, unique: false },
            since: {type: String,   required: true, index: false, unique: false },
            until: {type: String,   required: true, index: false, unique: false },
            month: {type: String,   required: true, index: false, unique: false },
            fullname: {type: String,   required: true, index: false, unique: false },
            dni: {type: String,   required: true, index: false, unique: false },
            locality: {type: String,   required: true, index: false, unique: false },
            address: {type: String,   required: true, index: false, unique: false },
            amount: {type: Number,   required: true, index: false, unique: false },
            comment: {type: String,   required: false, index: false, unique: false },
            group: {type: mongoose.Schema.Types.ObjectId, ref: 'GroupZone',  required: true, index: false, unique: false },
            createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: false, unique: false },
            updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: false, index: false, unique: false },
            status: {type: String, enum: ['activo', 'rechazado'],   required: false, index: false, unique: false, default: 'activo' },
            refuseComment: {type: String,   required: false, index: false, unique: false },
            refuseBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: false, index: false, unique: false }
}, {timestamps: true});

CovenantSchema.plugin(uniqueValidator, {message: 'validation.unique'});
CovenantSchema.plugin(mongoosePaginate);

CovenantSchema.virtual("id").get(function () {
    return this._id.toString();
});


CovenantSchema.set('toJSON', {getters: true, virtuals: true});

CovenantSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Covenant';
const COLLECTION_NAME = 'covenants';
const CovenantModel = mongoose.model<ICovenant, PaginateModel<ICovenant>>(MODEL_NAME, CovenantSchema,COLLECTION_NAME);

export {
    CovenantSchema,
    CovenantModel
}

export default CovenantModel
