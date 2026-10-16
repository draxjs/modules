interface ILoginRequest {
    username: string;
    password: string;
    rememberMe?: boolean;
}

interface IAuthTokens {
    accessToken: string;
    refreshToken?: string;
    /** ISO 8601 absolute expiry; rotation does not extend it. */
    refreshExpiresAt?: string;
}

interface IRefreshTokenRequest {
    refreshToken: string;
}

export type {ILoginRequest, IAuthTokens, IRefreshTokenRequest}
