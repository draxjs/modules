import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ITTSVoice} from '../interfaces/ITTSVoice'

const TTSVoiceSchema = new mongoose.Schema<ITTSVoice>({
    name: {type: String, required: true, index: true, unique: false},
    ttsProvider: {type: String, enum: ['ElevenLabs'], required: true, index: true, unique: false},
    voiceId: {type: String, required: true, index: true, unique: false},
    model: {type: String, required: false, index: true, unique: false},
    languageCode: {type: String, required: false, index: true, unique: false},
    tenant: {type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: false, index: true, unique: false},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true, unique: false}
}, {timestamps: true});

TTSVoiceSchema.index({ttsProvider: 1, voiceId: 1, tenant: 1}, {unique: true, sparse: true});
TTSVoiceSchema.plugin(uniqueValidator, {message: 'validation.unique'});
TTSVoiceSchema.plugin(mongoosePaginate);

TTSVoiceSchema.virtual("id").get(function () {
    return this._id.toString();
});

TTSVoiceSchema.set('toJSON', {getters: true, virtuals: true});
TTSVoiceSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'TTSVoice';
const COLLECTION_NAME = 'TTSVoice';
const TTSVoiceModel = mongoose.model<ITTSVoice, PaginateModel<ITTSVoice>>(MODEL_NAME, TTSVoiceSchema, COLLECTION_NAME);

export {
    TTSVoiceSchema,
    TTSVoiceModel
}

export default TTSVoiceModel
