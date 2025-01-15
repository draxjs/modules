import {DraxConfig} from "@drax/common-back";
import {EmailTransportService} from '../services/EmailTransportService.js'
import EmailTransportConfig from "../config/EmailTransportConfig.js";
import type {TransportGmailConfig, TransportSmtpConfig} from "../interfaces/ITransportConfig";

class EmailTransportServiceFactory {
    private static service: EmailTransportService;

    public static get instance(): EmailTransportService {
        if (!EmailTransportServiceFactory.service) {
            const type = EmailTransportServiceFactory.getType;
            const options = EmailTransportServiceFactory.getOptions;
            EmailTransportServiceFactory.service = new EmailTransportService(type, options);
        }
        return EmailTransportServiceFactory.service;
    }

    public static get getType()  {
        return DraxConfig.getOrLoad(EmailTransportConfig.type)
    }

    public static get getOptions()  {
        let options: TransportSmtpConfig | TransportGmailConfig;
        switch(DraxConfig.getOrLoad(EmailTransportConfig.type)){
            case 'smtp':
                options = {
                    host: DraxConfig.getOrLoad(EmailTransportConfig.smtpHost),
                    port: DraxConfig.getOrLoad(EmailTransportConfig.smtpPort),
                    secure: DraxConfig.getOrLoad(EmailTransportConfig.secure),
                    ignoreTLS: DraxConfig.getOrLoad(EmailTransportConfig.ignoreTLS),
                    auth: {
                        user: DraxConfig.getOrLoad(EmailTransportConfig.authUsername),
                        pass: DraxConfig.getOrLoad(EmailTransportConfig.authPassword),
                    },
                }
                break;
            case 'gmail':
                options = {
                    auth: {
                        user: DraxConfig.getOrLoad(EmailTransportConfig.authUsername),
                        pass: DraxConfig.getOrLoad(EmailTransportConfig.authPassword),
                    }
                }
                break;
            default:
                throw new Error(`Unsupported email service type: ${DraxConfig.getOrLoad(EmailTransportConfig.type)}`)
        }
        return options;
    }
}

export default EmailTransportServiceFactory
export {
    EmailTransportServiceFactory
}

