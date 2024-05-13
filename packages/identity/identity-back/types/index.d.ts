import { authRoutes } from "./routes/authRoutes.js";
declare const identityTypeDefs: import("@graphql-tools/utils").TypeSource;
declare const identityResolvers: import("@graphql-tools/utils").IResolvers;
declare const userService: import("./services/UserService.js").default;
declare const roleService: import("./services/RoleService.js").default;
declare const authService: import("./services/AuthService.js").default;
export { userService, roleService, authService, identityTypeDefs, identityResolvers, authRoutes };
//# sourceMappingURL=index.d.ts.map