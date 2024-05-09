declare const _default: {
    Query: {
        findRoleById: (_: any, { id }: {
            id: any;
        }) => Promise<import("../../interfaces/IRole.js").IRole>;
        paginateRole: () => Promise<{
            roles: import("../../interfaces/IRole.js").IRole[];
            totalCount: number;
        }>;
    };
    Mutation: {
        createRole: (_: any, { input }: {
            input: any;
        }) => Promise<import("../../interfaces/IRole.js").IRole>;
        updateRole: (_: any, { id, input }: {
            id: any;
            input: any;
        }) => Promise<import("../../interfaces/IRole.js").IRole>;
        deleteRole: (_: any, { id }: {
            id: any;
        }) => Promise<boolean>;
    };
};
export default _default;
//# sourceMappingURL=role.resolvers.d.ts.map