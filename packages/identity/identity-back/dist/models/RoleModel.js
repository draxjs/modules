import { mongoose, MongooseSoftDelete } from '@drax/common-back';
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2';
const Schema = mongoose.Schema;
const RoleSchema = new Schema({
    name: {
        type: String, unique: true, required: true, index: true,
        validate: [
            {
                validator: function (v) {
                    return !/(\s){2}/.test(v);
                },
                message: props => `Role name cant contain two spaces`
            },
        ],
    },
    permissions: [{ type: String, required: true }],
    childRoles: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role',
            required: false,
        }],
    readonly: { type: Boolean, required: false, default: false },
});
RoleSchema.plugin(uniqueValidator, { message: 'validation.unique' });
RoleSchema.plugin(MongooseSoftDelete);
RoleSchema.plugin(mongoosePaginate);
RoleSchema.set('toJSON', { getters: true });
const ROLE_MODEL_NAME = 'Role';
const ROLE_COLLECTION_NAME = 'roles';
const RoleModel = mongoose.model(ROLE_MODEL_NAME, RoleSchema, ROLE_COLLECTION_NAME);
export { RoleSchema, RoleModel };
export default RoleModel;
