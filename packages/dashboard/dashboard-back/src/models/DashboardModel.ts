import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IDashboard} from '../interfaces/IDashboard'

const DashboardSchema = new mongoose.Schema<IDashboard>({
    identifier: {type: String, required: true, index: true, unique: true},
    title: {type: String, required: true, index: true, unique: true},
    cards: [{
        title: {type: String, required: true, index: false, unique: false},
        entity: {type: String, required: true, index: false, unique: false},
        type: {type: String, enum: ['paginate', 'groupBy'], required: true, index: false, unique: false},
        filters: [{
            field: {type: String, required: true, index: false, unique: false},
            operator: {type: String, required: true, index: false, unique: false},
            value: {type: String, required: true, index: false, unique: false}
        }],
        layout: {
            cols: {type: Number, required: true, index: false, unique: false},
            sm: {type: Number, required: true, index: false, unique: false},
            md: {type: Number, required: true, index: false, unique: false},
            lg: {type: Number, required: true, index: false, unique: false},
            height: {type: Number, required: true, index: false, unique: false},
            cardVariant: {
                type: String,
                enum: ['text', 'flat', 'elevated', 'tonal', 'outlined', 'plain'],
                required: true,
                index: false,
                unique: false
            }
        },
        groupBy: {
            fields: [{type: String, required: true, index: false, unique: false}],
            dateFormat: {
                type: String,
                enum: ['year', 'month', 'day', 'hour', 'minute', 'second'],
                required: false,
                index: false,
                unique: false
            },
            render: {
                type: String,
                enum: ['table', 'gallery', 'pie', 'bars'],
                required: false,
                index: false,
                unique: false
            }
        },
        paginate: {
            columns: [{type: String, required: true, index: false, unique: false}],
            orderBy: {type: String, required: false, index: false, unique: false},
            order: {type: String, enum: ['asc', 'desc', null], required: false, index: false, unique: false}
        }
    }]
}, {timestamps: true});

DashboardSchema.plugin(uniqueValidator, {message: 'validation.unique'});
DashboardSchema.plugin(mongoosePaginate);

DashboardSchema.virtual("id").get(function () {
    return this._id.toString();
});


DashboardSchema.set('toJSON', {getters: true, virtuals: true});

DashboardSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Dashboard';
const COLLECTION_NAME = 'Dashboard';
const DashboardModel = mongoose.model<IDashboard, PaginateModel<IDashboard>>(MODEL_NAME, DashboardSchema, COLLECTION_NAME);

export {
    DashboardSchema,
    DashboardModel
}

export default DashboardModel
