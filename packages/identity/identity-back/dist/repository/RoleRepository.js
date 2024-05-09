import { RoleModel } from "../models/RoleModel.js";
class RoleRepository {
    async create(roleData) {
        const role = new RoleModel(roleData);
        await role.save();
        return role;
    }
    async update(_id, roleData) {
        const role = await RoleModel.findOneAndUpdate(_id, roleData, { new: true }).exec();
        return role;
    }
    async delete(_id) {
        const result = await RoleModel.deleteOne(_id).exec();
        return result.deletedCount == 1;
    }
    async findById(_id) {
        const role = await RoleModel.findById(_id).exec();
        return role;
    }
    async fetch() {
        const roles = await RoleModel.find().exec();
        return roles;
    }
    async paginate(query, options) {
        const roles = await RoleModel.paginate(query, options);
        return roles;
    }
}
export default RoleRepository;
