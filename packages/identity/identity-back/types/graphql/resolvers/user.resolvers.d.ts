declare const _default: {
    Query: {
        findUserById: (_: any, { id }: {
            id: any;
        }) => Promise<import("../../interfaces/IUser.js").IUser>;
        paginateUser: () => Promise<{
            roles: import("../../interfaces/IUser.js").IUser[];
            totalCount: number;
        }>;
    };
    Mutation: {
        createUser: (_: any, { input }: {
            input: any;
        }) => Promise<import("../../interfaces/IUser.js").IUser>;
        updateUser: (_: any, { id, input }: {
            id: any;
            input: any;
        }) => Promise<import("../../interfaces/IUser.js").IUser>;
        deleteUser: (_: any, { id }: {
            id: any;
        }) => Promise<boolean>;
    };
};
export default _default;
//# sourceMappingURL=user.resolvers.d.ts.map