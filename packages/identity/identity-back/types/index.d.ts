import { authRoutes } from "./routes/authRoutes.js";
import { jwtMiddleware } from "./middleware/jwtMiddleware.js";
import type { IJwtUser } from "./interfaces/IJwtUser.js";
declare const identityTypeDefs: import("@graphql-tools/utils").TypeSource;
declare const identityResolvers: import("@graphql-tools/utils").IResolvers;
declare const userService: import("./services/UserService.js").default;
declare const roleService: import("./services/RoleService.js").default;
declare const authService: import("./services/AuthService.js").default;
export type { IJwtUser };
export { userService, roleService, authService, identityTypeDefs, identityResolvers, authRoutes, jwtMiddleware, };
//# sourceMappingURL=index.d.ts.map