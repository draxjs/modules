
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IAILog} from '@drax/ai-share'

const AILogSchema = new mongoose.Schema<IAILog>({
            provider: {type: String,   required: false, index: true, unique: false },
            model: {type: String,   required: false, index: true, unique: false },
            operationTitle: {type: String,   required: false, index: false, unique: false },
            operationGroup: {type: String,   required: false, index: false, unique: false },
            ip: {type: String,   required: false, index: false, unique: false },
            userAgent: {type: String,   required: false, index: false, unique: false },
            input: {type: String,   required: false, index: false, unique: false },
            inputImages: [{
                        filename: {type: String,   required: false, index: false, unique: false },
            filepath: {type: String,   required: false, index: false, unique: false },
            size: {type: Number,   required: false, index: false, unique: false },
            mimetype: {type: String,   required: false, index: false, unique: false },
            url: {type: String,   required: false, index: false, unique: false }
            }],
            inputFiles: [{
                        filename: {type: String,   required: false, index: false, unique: false },
            filepath: {type: String,   required: false, index: false, unique: false },
            size: {type: Number,   required: false, index: false, unique: false },
            mimetype: {type: String,   required: false, index: false, unique: false },
            url: {type: String,   required: false, index: false, unique: false }
            }],
            inputTokens: {type: Number,   required: false, index: false, unique: false },
            outputTokens: {type: Number,   required: false, index: false, unique: false },
            tokens: {type: Number,   required: false, index: false, unique: false },
            startedAt: {type: Date,   required: false, index: false, unique: false },
            endedAt: {type: Date,   required: false, index: false, unique: false },
            responseTime: {type: String,   required: false, index: false, unique: false },
            output: {type: String,   required: false, index: false, unique: false },
            success: {type: Boolean,   required: false, index: false, unique: false },
            statusCode: {type: Number,   required: false, index: false, unique: false },
            errorMessage: {type: String,   required: false, index: false, unique: false },
            tenant: {type: mongoose.Schema.Types.ObjectId, ref: 'Tenant',  required: false, index: false, unique: false },
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: false, index: false, unique: false }
}, {timestamps: true});

AILogSchema.plugin(uniqueValidator, {message: 'validation.unique'});
AILogSchema.plugin(mongoosePaginate);

AILogSchema.virtual("id").get(function () {
    return this._id.toString();
});


AILogSchema.set('toJSON', {getters: true, virtuals: true});

AILogSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'AILog';
const COLLECTION_NAME = 'AILog';
const AILogModel = mongoose.model<IAILog, PaginateModel<IAILog>>(MODEL_NAME, AILogSchema,COLLECTION_NAME);

export {
    AILogSchema,
    AILogModel
}

export default AILogModel
