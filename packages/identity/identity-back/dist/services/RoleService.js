class RoleService {
    constructor(roleRepostitory) {
        this._repository = roleRepostitory;
    }
    async create(roleData) {
        const role = await this._repository.create(roleData);
        return role;
    }
    async update(id, roleData) {
        const role = await this._repository.update(id, roleData);
        return role;
    }
    async delete(id) {
        const deletedRole = await this._repository.delete(id);
        return deletedRole;
    }
    async findById(id) {
        const role = await this._repository.findById(id);
        return role;
    }
    async paginate(page = 1, limit = 1, filters) {
        const pagination = await this._repository.paginate(page, limit, filters);
        return pagination;
    }
}
export default RoleService;
