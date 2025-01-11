interface TransportSmtpConfig {
    host: string;
    port: number;
    secure: boolean;
    ignoreTLS: boolean;
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
}


export type {TransportSmtpConfig, TransportGmailConfig}
