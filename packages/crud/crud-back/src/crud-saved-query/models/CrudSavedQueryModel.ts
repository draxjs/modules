import {mongoose} from "@drax/common-back";
import type {PaginateModel} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import type {ICrudSavedQuery} from "../interfaces/ICrudSavedQuery";

const FieldFilterSchema = new mongoose.Schema({
    field: {type: String, required: true},
    operator: {type: String, required: false, default: "eq"},
    value: {type: mongoose.Schema.Types.Mixed, required: false},
    orGroup: {type: String, required: false}
}, {_id: false});

const DynamicFilterSchema = new mongoose.Schema({
    default: {type: mongoose.Schema.Types.Mixed, required: false},
    label: {type: String, required: false},
    name: {type: String, required: true},
    operator: {type: String, required: false, default: "eq"},
    type: {type: String, required: false, default: "string"},
    permission: {type: String, required: false},
    value: {type: mongoose.Schema.Types.Mixed, required: false},
    ref: {type: String, required: false},
    refDisplay: {type: String, required: false},
    enum: {type: [mongoose.Schema.Types.Mixed], required: false}
}, {_id: false, strict: false});

const CrudSavedQuerySchema = new mongoose.Schema<ICrudSavedQuery>({
    entity: {type: String, required: true, index: true},
    name: {type: String, required: true, index: true},
    shared: {type: Boolean, required: false, default: false, index: true},
    columns: [{type: String, required: true}],
    staticFilters: {type: [FieldFilterSchema], required: false, default: []},
    dynamicFilters: {type: [DynamicFilterSchema], required: false, default: []},
    tenant: {type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: false, index: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, index: true}
}, {timestamps: true});

CrudSavedQuerySchema.index({entity: 1, name: 1, tenant: 1, user: 1});
CrudSavedQuerySchema.plugin(mongoosePaginate);

CrudSavedQuerySchema.virtual("id").get(function () {
    return this._id.toString();
});

CrudSavedQuerySchema.set("toJSON", {getters: true, virtuals: true});
CrudSavedQuerySchema.set("toObject", {getters: true, virtuals: true});

const CrudSavedQueryModel = mongoose.model<ICrudSavedQuery, PaginateModel<ICrudSavedQuery>>(
    "CrudSavedQuery",
    CrudSavedQuerySchema,
    "CrudSavedQuery"
);

export {CrudSavedQuerySchema, CrudSavedQueryModel};
export default CrudSavedQueryModel;
