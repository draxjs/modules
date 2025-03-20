import {mongoose, MongooseSoftDelete} from '@drax/common-back';
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import {ITenant} from '@drax/identity-share'
const Schema = mongoose.Schema
import {PaginateModel} from "mongoose";


const TenantMongoSchema = new Schema<ITenant>({
    name: {type: String, unique: true, required: true, index: true,},
}, {timestamps: true, toJSON: {  virtuals: true}, toObject: { virtuals: true}});


TenantMongoSchema.virtual("id").get(function () {
    return this._id.toString();
});

TenantMongoSchema.plugin(uniqueValidator, {message: 'validation.unique'});
TenantMongoSchema.plugin(MongooseSoftDelete);
TenantMongoSchema.plugin(mongoosePaginate);


TenantMongoSchema.set('toJSON', {getters: true, virtuals: true});

const TENANT_MODEL_NAME = 'Tenant';
const TENANT_COLLECTION_NAME = 'tenants';
const TenantModel = mongoose.model<ITenant, PaginateModel<ITenant>>(TENANT_MODEL_NAME, TenantMongoSchema,TENANT_COLLECTION_NAME);

export {
    TenantMongoSchema,
    TenantModel
}

export default TenantModel

