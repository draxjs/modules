import { mongoose } from '@dracul/common-backend'
const softDelete = require('mongoose-softdelete')
const mongoosePaginate = require('mongoose-paginate-v2')

const Schema = mongoose.Schema
const fileReplacesInfoSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId },
    username: {type: String},
    date: { type: Date },
})

const FileSchema = new Schema({
    filename: { type: String, required: true },
    relativePath: { type: String, required: true, index: true },
    absolutePath: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String, required: false },
    tags: [{ type: String, required: false }],
    mimetype: { type: String, required: true },
    encoding: { type: String, required: true },
    extension: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },

    lastAccess: { type: Date, required: true, default: Date.now },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
    createdBy: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
        username: { type: String, required: false }
    },
    updatedBy: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
        username: { type: String, required: false }
    },
    createdFor: { type: String, required: false },
    ttlSeconds: {type: Number, required: true},
    expiresAt: { type: Date, required: false },
    isPublic: { type: Boolean, required: false, default: true },
    hits: { type: Number, require: false, default: 0 },
   
});

FileSchema.plugin(mongoosePaginate)
const File = mongoose.model('File', FileSchema)

module.exports = File
