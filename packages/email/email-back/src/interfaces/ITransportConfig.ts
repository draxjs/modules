interface TransportSmtpConfig {
    host: string;
    port: number;
    secure: boolean;
    ignoreTLS: boolean;
    rateDelta?: number;
    rateLimit?: number;
    auth: {
        type: 'login' | 'oauth2';
        user: string;
        pass: string;
    } | null;
}

interface TransportGmailConfig {
    auth: {
        user: string;
        pass: string;
    };
    rateDelta?: number;
    rateLimit?: number;
}


export type {TransportSmtpConfig, TransportGmailConfig}
