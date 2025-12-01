import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IAudit} from '@drax/audit-share'

const AuditSchema = new mongoose.Schema<IAudit>({
    entity: {type: String, required: true, index: true, unique: false},
    resourceId: {type: String, required: false, index: true, unique: false},
    user: {
        id: {type: String, required: true, index: true, unique: false},
        username: {type: String, required: true, index: false, unique: false},
        rolName: {type: String, required: false, index: false, unique: false}
    },
    action: {type: String, required: true, index: true, unique: false},
    ip: {type: String, required: false, index: false, unique: false},
    userAgent: {type: String, required: false, index: false, unique: false},
    changes: [{
        field: {type: String, required: true, index: false, unique: false},
        old: {type: mongoose.Schema.Types.Mixed, required: false, index: false, unique: false},
        new: {type: mongoose.Schema.Types.Mixed, required: false, index: false, unique: false}
    }],
    sessionId: {type: String, required: false, index: true, unique: false},
    requestId: {type: String, required: false, index: true, unique: false},
    detail: {type: String, required: false, index: false, unique: false},
    tenant: {
        id: {type: String, required: false, index: true, unique: false},
        name: {type: String, required: false, index: true, unique: false}
    },
    apiKey: {
        id: {type: String, required: false, index: true, unique: false},
        name: {type: String, required: false, index: true, unique: false}
    }
}, {timestamps: true});

AuditSchema.plugin(uniqueValidator, {message: 'validation.unique'});
AuditSchema.plugin(mongoosePaginate);

AuditSchema.virtual("id").get(function () {
    return this._id.toString();
});


AuditSchema.set('toJSON', {getters: true, virtuals: true});

AuditSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Audit';
const COLLECTION_NAME = 'Audit';
const AuditModel = mongoose.model<IAudit, PaginateModel<IAudit>>(MODEL_NAME, AuditSchema, COLLECTION_NAME);

export {
    AuditSchema,
    AuditModel
}

export default AuditModel
