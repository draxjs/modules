
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IPerson} from '../interfaces/IPerson'

const PersonSchema = new mongoose.Schema<IPerson>({
            fullname: {type: String,   required: true, index: true, unique: true },
            live: {type: Boolean,   required: false, index: false, unique: false },
            birthdate: {type: Date,   required: false, index: false, unique: false },
            secret: {type: String,   required: false, index: false, unique: false },
            nationality: {type: mongoose.Schema.Types.ObjectId, ref: 'Country',  required: false, index: false, unique: false },
            hobbies: [{type: String,   required: false, index: false, unique: false }],
            race: {type: String,  enum: ['human', 'elf', 'orc'], required: false, index: false, unique: false },
            interests: [{type: String,  enum: ['sports', 'music', 'reading', 'travel', 'cooking', 'technology'], required: false, index: false, unique: false }],
            languages: [{type: mongoose.Schema.Types.ObjectId, ref: 'Language',  required: false, index: false, unique: false }],
            address: {
            country: {type: String,   required: false, index: false, unique: false },
            city: {type: String,   required: false, index: false, unique: false },
            street: {type: String,   required: true, index: false, unique: false },
            zip: {type: String,   required: false, index: false, unique: false } 
            },
            skills: [{ 
                        name: {type: String,   required: true, index: false, unique: false },
            level: {type: Number,   required: false, index: false, unique: false } 
            }],
            tenant: {type: mongoose.Schema.Types.ObjectId, ref: 'Tenant',  required: false, index: false, unique: false },
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: false, index: false, unique: false }
}, {timestamps: true});

PersonSchema.plugin(uniqueValidator, {message: 'validation.unique'});
PersonSchema.plugin(mongoosePaginate);

const MODEL_NAME = 'Person';
const COLLECTION_NAME = 'Person';
const PersonModel = mongoose.model<IPerson, PaginateModel<IPerson>>(MODEL_NAME, PersonSchema,COLLECTION_NAME);

export {
    PersonSchema,
    PersonModel
}

export default PersonModel
