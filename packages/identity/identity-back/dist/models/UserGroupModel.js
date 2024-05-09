import { mongoose, MongooseSoftDelete } from '@drax/common-back';
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2';
// Defining user Mongoose Schema
const UserGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        index: true,
        validate: {
            validator: function (value) {
                let r = /^[a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*$/;
                return r.test(value);
            },
            message: "Invalid name format"
        }
    },
    users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        }],
}, { timestamps: true });
UserGroupSchema.set('toJSON', { getters: true });
UserGroupSchema.plugin(uniqueValidator, { message: 'validation.unique' });
UserGroupSchema.plugin(MongooseSoftDelete);
UserGroupSchema.plugin(mongoosePaginate);
const USERGROUP_MODEL_NAME = 'UserGroup';
const USERGROUP_COLLECTION_NAME = 'userGroups';
const UserGroupModel = mongoose.model(USERGROUP_MODEL_NAME, UserGroupSchema, USERGROUP_COLLECTION_NAME);
export { UserGroupSchema, UserGroupModel };
export default UserGroupModel;
