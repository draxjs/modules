import UserService from "./UserService.js";
declare class AuthService {
    private _userService;
    constructor(userService: UserService);
    auth(username: string, password: string): Promise<{
        accessToken: string;
    }>;
}
export default AuthService;
//# sourceMappingURL=AuthService.d.ts.map