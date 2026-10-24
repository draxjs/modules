export const userSecretFields = [
    'password', 'emailCode', 'emailCodeExpiresAt', 'emailVerificationLastAttemptAt', 'phoneCode', 'recoveryCode',
] as const;

export function hideUserSecrets(user: any) {
    if (!user) return user;
    for (const field of userSecretFields) delete user[field];
    return user;
}
