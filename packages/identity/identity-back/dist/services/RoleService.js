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
    async paginate(filters, page = 1, limit = 10) {
        const query = {};
        const options = {
            page: page,
            limit: limit
        };
        const pagination = await this._repository.paginate(query, options);
        return pagination;
    }
}
export default RoleService;
