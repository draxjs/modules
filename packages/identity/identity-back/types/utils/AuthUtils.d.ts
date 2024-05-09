declare class AuthUtils {
    static hashPassword(password: string): string;
    static checkPassword(password: string, hashPassword: string): boolean;
    static tokenSignPayload(userId: string, username: string, session: string): {
        id: string;
        username: string;
        session: string;
    };
    static generateToken(userId: string, username: string, session: string): string;
}
export default AuthUtils;
//# sourceMappingURL=AuthUtils.d.ts.map