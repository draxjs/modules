import {DraxConfig} from "@drax/common-back";
import {EmailService} from '../services/EmailService.js'
import EmailConfig from "../config/EmailConfig";
import {TransportGmailConfig, TransportSmtpConfig} from "../interfaces/ITransportConfig";

class EmailServiceFactory {
    private static service: EmailService;

    public static get instance(): EmailService {
        if (!EmailServiceFactory.service) {
            const type = EmailServiceFactory.getType;
            const options = EmailServiceFactory.getOptions;
            EmailServiceFactory.service = new EmailService(type, options);
        }
        return EmailServiceFactory.service;
    }

    public static get getType()  {
        return DraxConfig.getOrLoad(EmailConfig.type)
    }

    public static get getOptions()  {
        let options: TransportSmtpConfig | TransportGmailConfig;
        switch(DraxConfig.getOrLoad(EmailConfig.type)){
            case 'smtp':
                options = {
                    host: DraxConfig.getOrLoad(EmailConfig.smtpHost),
                    port: DraxConfig.getOrLoad(EmailConfig.smtpPort),
                    secure: DraxConfig.getOrLoad(EmailConfig.secure),
                    ignoreTLS: DraxConfig.getOrLoad(EmailConfig.ignoreTLS),
                    auth: {
                        user: DraxConfig.getOrLoad(EmailConfig.authUsername),
                        pass: DraxConfig.getOrLoad(EmailConfig.authPassword),
                    },
                }
                break;
            case 'gmail':
                options = {
                    auth: {
                        user: DraxConfig.getOrLoad(EmailConfig.authUsername),
                        pass: DraxConfig.getOrLoad(EmailConfig.authPassword),
                    }
                }
                break;
            default:
                throw new Error(`Unsupported email service type: ${DraxConfig.getOrLoad(EmailConfig.type)}`)
        }
        return options;
    }
}

export default EmailServiceFactory
export {
    EmailServiceFactory
}

