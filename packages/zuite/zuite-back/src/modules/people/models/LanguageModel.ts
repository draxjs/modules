
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ILanguage} from '../interfaces/ILanguage'

const LanguageSchema = new mongoose.Schema<ILanguage>({
            name: {type: String,   required: true, index: true, unique: true }
}, {timestamps: true});

LanguageSchema.plugin(uniqueValidator, {message: 'validation.unique'});
LanguageSchema.plugin(mongoosePaginate);

const MODEL_NAME = 'Language';
const COLLECTION_NAME = 'Language';
const LanguageModel = mongoose.model<ILanguage, PaginateModel<ILanguage>>(MODEL_NAME, LanguageSchema,COLLECTION_NAME);

export {
    LanguageSchema,
    LanguageModel
}

export default LanguageModel
