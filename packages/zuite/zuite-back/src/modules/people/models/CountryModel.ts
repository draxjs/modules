
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ICountry} from '../interfaces/ICountry'

const CountrySchema = new mongoose.Schema<ICountry>({
            name: {type: String,  required: true, index: true, unique: true }
}, {timestamps: true});

CountrySchema.plugin(uniqueValidator, {message: 'validation.unique'});
CountrySchema.plugin(mongoosePaginate);

const MODEL_NAME = 'Country';
const COLLECTION_NAME = 'Country';
const CountryModel = mongoose.model<ICountry, PaginateModel<ICountry>>(MODEL_NAME, CountrySchema,COLLECTION_NAME);

export {
    CountrySchema,
    CountryModel
}

export default CountryModel
