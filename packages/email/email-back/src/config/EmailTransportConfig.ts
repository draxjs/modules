enum EmailTransportConfig {
    type = "EMAIL_TYPE",
    service = "EMAIL_SERVICE",
    smtpHost = "EMAIL_HOST",
    smtpPort = "EMAIL_PORT",
    authType = "EMAIL_AUTH_TYPE",
    authUsername = "EMAIL_AUTH_USERNAME",
    authPassword = "EMAIL_AUTH_PASSWORD",
    secure = "EMAIL_SECURE",
    ignoreTLS = "EMAIL_IGNORE_TLS",
    rateDelta="EMAIL_RATE_DELTA",
    rateLimit="EMAIL_RATE_LIMIT"
}

export default EmailTransportConfig;
export {EmailTransportConfig};
