
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ICountry} from '../interfaces/ICountry'

const CountrySchema = new mongoose.Schema<ICountry>({
            name: {type: String,   required: true, index: true, unique: true },
            description: {type: String,   required: false, index: false, unique: false },
            flag: {type: String,   required: false, index: false, unique: false },
            tenant: {type: mongoose.Schema.Types.ObjectId, ref: 'Tenant',  required: true, index: true, unique: true },
            createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true, unique: true }
}, {timestamps: true});

CountrySchema.plugin(uniqueValidator, {message: 'validation.unique'});
CountrySchema.plugin(mongoosePaginate);

CountrySchema.virtual("id").get(function () {
    return this._id.toString();
});


CountrySchema.set('toJSON', {getters: true, virtuals: true});

CountrySchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Country';
const COLLECTION_NAME = 'Country';
const CountryModel = mongoose.model<ICountry, PaginateModel<ICountry>>(MODEL_NAME, CountrySchema,COLLECTION_NAME);

export {
    CountrySchema,
    CountryModel
}

export default CountryModel
