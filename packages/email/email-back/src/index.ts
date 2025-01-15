import EmailTransportConfig from "./config/EmailTransportConfig.js";
import EmailLayoutConfig from "./config/EmailLayoutConfig.js";
import EmailTransportService from "./services/EmailTransportService.js";
import EmailLayoutService from "./services/EmailLayoutService.js";
import EmailTransportServiceFactory from "./factory/EmailTransportServiceFactory.js";
import EmailLayoutServiceFactory from "./factory/EmailLayoutServiceFactory.js";

import type {IEmailLayout} from "./interfaces/IEmailLayout"
import type {TransportGmailConfig, TransportSmtpConfig} from "./interfaces/ITransportConfig"

export type {
    IEmailLayout,
    TransportGmailConfig,
    TransportSmtpConfig,
}


export {
    EmailTransportConfig,
    EmailLayoutConfig,
    EmailTransportServiceFactory,
    EmailTransportService,
    EmailLayoutServiceFactory,
    EmailLayoutService,
}
