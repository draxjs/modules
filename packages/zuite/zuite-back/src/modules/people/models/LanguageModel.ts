
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ILanguage} from '../interfaces/ILanguage'

const LanguageSchema = new mongoose.Schema<ILanguage>({
            name: {type: String,   required: true, index: true, unique: true },
            icon: {
        filename: {type: String ,  required: false, index: false, unique: false },
        filepath: {type: String ,  required: false, index: false, unique: false },
        size: {type: Number ,  required: false, index: false, unique: false },
        mimetype: {type: String ,  required: false, index: false, unique: false },
        url: {type: String ,  required: false, index: false, unique: false },
        }
}, {timestamps: true});

LanguageSchema.plugin(uniqueValidator, {message: 'validation.unique'});
LanguageSchema.plugin(mongoosePaginate);

LanguageSchema.virtual("id").get(function () {
    return this._id.toString();
});


LanguageSchema.set('toJSON', {getters: true, virtuals: true});

LanguageSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Language';
const COLLECTION_NAME = 'Language';
const LanguageModel = mongoose.model<ILanguage, PaginateModel<ILanguage>>(MODEL_NAME, LanguageSchema,COLLECTION_NAME);

export {
    LanguageSchema,
    LanguageModel
}

export default LanguageModel
