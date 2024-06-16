import RoleServiceFactory from "../../factory/RoleServiceFactory.js";

const roleService = RoleServiceFactory()
export default {
    Query: {
        findRoleById:  async (_,{id}) => {
            return await roleService.findById(id)
        },
        fetchRole: async () => {
            return await roleService.fetchAll()
        },
        paginateRole: async () => {
            return await roleService.paginate()
        }
    },
    Mutation: {
        createRole: async (_,{input}) => {
            return await roleService.create(input)

        },
        updateRole: async (_,{id, input}) => {
            return await roleService.update(id, input)
        },
        deleteRole: async (_,{id}) => {
            return await roleService.delete(id)
        }
    }
}
