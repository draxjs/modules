import { RoleModel } from "../models/RoleModel.js";
class RoleRepository {
    async create(roleData) {
        const role = new RoleModel(roleData);
        await role.save();
        return role;
    }
    async update(id, roleData) {
        const role = await RoleModel.findOneAndUpdate(id, roleData, { new: true }).exec();
        return role;
    }
    async delete(id) {
        const result = await RoleModel.deleteOne(id).exec();
        return result.deletedCount == 1;
    }
    async findById(id) {
        const role = await RoleModel.findById(id).exec();
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
