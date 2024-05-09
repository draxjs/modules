import { UserModel } from "../models/UserModel.js";
class UserRepository {
    async create(userData) {
        const user = new UserModel(userData);
        await user.save();
        await user.populate('role');
        return user;
    }
    async update(_id, userData) {
        const user = await UserModel.findOneAndUpdate(_id, userData).populate('role').exec();
        return user;
    }
    async delete(_id) {
        const result = await UserModel.deleteOne(_id).exec();
        return result.deletedCount == 1;
    }
    async findById(_id) {
        console.log("_id", _id);
        const user = await UserModel.findById(_id).populate('role').exec();
        console.log("user", user);
        return user;
    }
    async findByUsername(username) {
        const user = await UserModel.findOne({ username: username }).populate('role').exec();
        return user;
    }
    async paginate(query, options) {
        options.populate = ['role'];
        const userPaginated = await UserModel.paginate(query, options);
        return userPaginated;
    }
}
export default UserRepository;
