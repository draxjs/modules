import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IFile} from '../interfaces/IFile'

const FileSchema = new mongoose.Schema<IFile>({
    filename: {type: String, required: true, index: false, unique: false},
    relativePath: {type: String, required: true, index: true, unique: false},
    absolutePath: {type: String, required: true, index: false, unique: false},
    url: {type: String, required: true, index: false, unique: false},
    description: {type: String, required: false, index: false, unique: false},
    tags: [{type: String, required: false, index: false, unique: false}],
    mimetype: {type: String, required: true, index: false, unique: false},
    encoding: {type: String, required: false, index: false, unique: false},
    extension: {type: String, required: false, index: false, unique: false},
    size: {type: Number, required: true, index: false, unique: false},
    type: {type: String, required: false, index: false, unique: false},
    lastAccess: {type: Date, required: false, index: false, unique: false},
    createdBy: {
        id: {type:  mongoose.Schema.Types.ObjectId, required: false, index: false, unique: false},
        username: {type: String, required: false, index: false, unique: false}
    },
    updatedBy: {
        id: {type:  mongoose.Schema.Types.ObjectId, required: false, index: false, unique: false},
        username: {type: String, required: false, index: false, unique: false}
    },
    createdFor: {type: String, required: false, index: false, unique: false},
    ttlSeconds: {type: Number, required: false  , index: false, unique: false},
    expiresAt: {type: Date, required: false, index: false, unique: false},
    isPublic: {type: Boolean, required: false, index: false, unique: false},
    hits: {type: Number, required: false, index: false, unique: false},
    tenant: {type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: false, index: false, unique: false},
}, {timestamps: true});

FileSchema.plugin(uniqueValidator, {message: 'validation.unique'});
FileSchema.plugin(mongoosePaginate);

FileSchema.virtual("id").get(function () {
    return this._id.toString();
});


FileSchema.set('toJSON', {getters: true, virtuals: true});

FileSchema.set('toObject', {getters: true, virtuals: true});


FileSchema.pre("validate", function (next) {
    if (this.ttlSeconds && !this.expiresAt) {
        this.expiresAt = new Date(Date.now() + this.ttlSeconds * 1000)
    }
    next()
})

const MODEL_NAME = 'File';
const COLLECTION_NAME = 'File';
const FileModel = mongoose.model<IFile, PaginateModel<IFile>>(MODEL_NAME, FileSchema, COLLECTION_NAME);

export {
    FileSchema,
    FileModel
}

export default FileModel
