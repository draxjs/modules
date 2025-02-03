import {mongoose} from '@drax/common-back';
import uniqueValidator from 'mongoose-unique-validator';
import {ISetting} from "@drax/settings-share";


const SettingSchema = new mongoose.Schema<ISetting>({

    key: {type: String, required: true, unique: true},
    value: {type: mongoose.Schema.Types.Mixed, required: false, unique: false},
    //valueList: [{type: String, required: false, unique: false}],
    label: {type: String, required: false},
    group: {type: String, required: true},
    type: {type: String, default: "string", enum: ['string','longString','number','enum','boolean', 'password', 'stringList','numberList', 'enumList', 'ref', 'secret'], required: false, unique: false},
    options: [{type: String}],
    regex: {type: String},
    entity: {type: String, required: false},
    entityValue: {type: String, required: false},
    entityText: {type: String, required: false, unique: false},
    prefix: {type: String, required: false},
    suffix: {type: String, required: false},
})

SettingSchema.virtual("id").get(function () {
    return this._id.toHexString();
});


SettingSchema.set('toJSON', {getters: true, virtuals: true,});

SettingSchema.set('toObject', {getters: true, virtuals: true,});

SettingSchema.plugin(uniqueValidator, {message: 'validation.unique'});



const MODEL_NAME = 'Setting';
const COLLECTION_NAME = 'settings';

const SettingModel = mongoose.model<ISetting>(MODEL_NAME, SettingSchema,COLLECTION_NAME);

export {
    SettingSchema,
    SettingModel
}

export default SettingModel
