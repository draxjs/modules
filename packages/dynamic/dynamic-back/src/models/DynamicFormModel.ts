import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IDynamicForm, IDynamicFormFieldSchema} from '../interfaces/IDynamicForm'

const DynamicFormFieldSchema = new mongoose.Schema<IDynamicFormFieldSchema>({
    type: {
        type: String,
        enum: ['string', 'longString', 'number', 'boolean', 'date', 'ref', 'enum', 'password', 'file', 'array.string', 'array.number', 'array.ref', 'array.enum', 'array.file'],
        required: true,
        index: false,
        unique: false
    },
    name: {type: String, required: true, index: false, unique: false},
    default: {type: String, required: false, index: false, unique: false},
    required: {type: Boolean, required: false, index: false, unique: false},
    validationRegex: {type: String, required: false, index: false, unique: false},
    options: {type: [String], required: false, index: false, unique: false, default: []},
})

const DynamicFormSchema = new mongoose.Schema<IDynamicForm>({
    identifier: {type: String, required: true, index: true, unique: true},
    fields: [DynamicFormFieldSchema]
}, {timestamps: true});

DynamicFormSchema.plugin(uniqueValidator, {message: 'validation.unique'});
DynamicFormSchema.plugin(mongoosePaginate);

const MODEL_NAME = 'DynamicForm';
const COLLECTION_NAME = 'DynamicForm';
const DynamicFormModel = mongoose.model<IDynamicForm, PaginateModel<IDynamicForm>>(MODEL_NAME, DynamicFormSchema, COLLECTION_NAME);

export {
    DynamicFormFieldSchema,
    DynamicFormSchema,
    DynamicFormModel
}

export default DynamicFormModel
