
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IAgentSession} from '../interfaces/IAgentSession'

const AgentSessionSchema = new mongoose.Schema<IAgentSession>({
            sessionId: {type: String,   required: true, index: true, unique: false },
            title: {type: String,   required: false, index: false, unique: false },
            lastMessageAt: {type: Date,   required: false, index: true, unique: false },
            messages: [{ 
                        role: {type: String,  enum: ['user', 'assistant', 'system'], required: true, index: false, unique: false },
            content: {type: String,   required: true, index: false, unique: false },
            createdAt: {type: Date,   required: false, index: false, unique: false } 
            }],
            messageCount: {type: Number,   required: false, index: false, unique: false },
            inputTokens: {type: Number,   required: false, index: false, unique: false },
            outputTokens: {type: Number,   required: false, index: false, unique: false },
            tokens: {type: Number,   required: false, index: false, unique: false },
            tenant: {type: mongoose.Schema.Types.ObjectId, ref: 'Tenant',  required: false, index: true, unique: false },
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: false, index: true, unique: false }
}, {timestamps: true});

AgentSessionSchema.plugin(uniqueValidator, {message: 'validation.unique'});
AgentSessionSchema.plugin(mongoosePaginate);

AgentSessionSchema.virtual("id").get(function () {
    return this._id.toString();
});


AgentSessionSchema.set('toJSON', {getters: true, virtuals: true});

AgentSessionSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'AgentSession';
const COLLECTION_NAME = 'AgentSession';
const AgentSessionModel = mongoose.model<IAgentSession, PaginateModel<IAgentSession>>(MODEL_NAME, AgentSessionSchema,COLLECTION_NAME);

export {
    AgentSessionSchema,
    AgentSessionModel
}

export default AgentSessionModel
