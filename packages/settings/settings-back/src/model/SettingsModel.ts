import {mongoose} from '@drax/common-back';
import uniqueValidator from 'mongoose-unique-validator';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'
import {ISetting} from "@drax/settings-share";


const SettingSchema = new mongoose.Schema<ISetting>({

    key: {type: String, required: true, unique: true},
    value: {type: mongoose.Schema.Types.Mixed, required: false, unique: false},
    //valueList: [{type: String, required: false, unique: false}],
    label: {type: String, required: false},
    category: {type: String, required: true},
    type: {type: String, default: "string", enum: ['string','longString','number','enum','boolean', 'password', 'stringList','numberList', 'enumList', 'ref', 'secret'], required: false, unique: false},
    options: [{type: String}],
    regex: {type: String},
    entity: {type: String, required: false},
    entityValue: {type: String, required: false},
    entityText: {type: String, required: false, unique: false},
    prefix: {type: String, required: false},
    suffix: {type: String, required: false},
}, {timestamps: true, toJSON: {  virtuals: true}, toObject: {virtuals: true} })

SettingSchema.virtual("id").get(function () {
    return this._id.toString();
});

SettingSchema.plugin(uniqueValidator, {message: 'validation.unique'});
SettingSchema.plugin(mongooseLeanVirtuals);



const MODEL_NAME = 'Setting';
const COLLECTION_NAME = 'settings';

const SettingModel = mongoose.model<ISetting>(MODEL_NAME, SettingSchema,COLLECTION_NAME);

export {
    SettingSchema,
    SettingModel
}

export default SettingModel
