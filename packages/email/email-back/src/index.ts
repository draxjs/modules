import EmailConfig from "./config/EmailConfig.js";
import EmailService from "./services/EmailService.js";
import EmailLayoutService from "./services/EmailLayoutService.js";
import type {IEmailLayout} from "./interfaces/IEmailLayout"
import type {TransportGmailConfig, TransportSmtpConfig} from "./interfaces/ITransportConfig"

export type {
    IEmailLayout,
    TransportGmailConfig,
    TransportSmtpConfig,
}


export {
    EmailConfig,
    EmailService,
    EmailLayoutService,
}
