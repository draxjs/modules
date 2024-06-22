import {mongoose, MongooseSoftDelete} from '@drax/common-back';
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import {ITenant} from '../interfaces/ITenant'
const Schema = mongoose.Schema
import {PaginateModel} from "mongoose";


const TenantSchema = new Schema<ITenant>({
    name: {
        type: String, unique: true, required: true, index: true,
    },
});

TenantSchema.plugin(uniqueValidator, {message: 'validation.unique'});
TenantSchema.plugin(MongooseSoftDelete);
TenantSchema.plugin(mongoosePaginate);


TenantSchema.set('toJSON', {getters: true});

const TENANT_MODEL_NAME = 'Tenant';
const TENANT_COLLECTION_NAME = 'tenants';
const TenantModel = mongoose.model<ITenant, PaginateModel<ITenant>>(TENANT_MODEL_NAME, TenantSchema,TENANT_COLLECTION_NAME);

export {
    TenantSchema,
    TenantModel
}

export default TenantModel

