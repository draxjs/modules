interface ILoginResponse {
    accessToken: string;
    refreshToken?: string;
    refreshExpiresAt?: string;
}

export type {ILoginResponse}
