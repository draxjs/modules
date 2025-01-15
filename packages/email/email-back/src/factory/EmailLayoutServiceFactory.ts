import {DraxConfig} from "@drax/common-back";
import {EmailLayoutService} from '../services/EmailLayoutService.js'
import EmailLayoutConfig from "../config/EmailLayoutConfig.js";
import type {IEmailLayout} from "../interfaces/IEmailLayout";

class EmailLayoutServiceFactory {
    private static service: EmailLayoutService;

    public static get instance(): EmailLayoutService {
        if (!EmailLayoutServiceFactory.service) {
            const options: IEmailLayout = EmailLayoutServiceFactory.getOptions;
            console.log("IEmailLayout options:", options);
            EmailLayoutServiceFactory.service = new EmailLayoutService(options);
        }
        return EmailLayoutServiceFactory.service;
    }

    public static get getOptions(): IEmailLayout  {
        let options: IEmailLayout;

                options = {
                    bodyStyle: DraxConfig.getOrLoad(EmailLayoutConfig.bodyStyle),
                    maxWidth: DraxConfig.getOrLoad(EmailLayoutConfig.maxWidth),
                    headerCentered: DraxConfig.getOrLoad(EmailLayoutConfig.headerCentered),
                    headerBgColor: DraxConfig.getOrLoad(EmailLayoutConfig.headerBgColor),
                    headerColor: DraxConfig.getOrLoad(EmailLayoutConfig.headerColor),
                    headerImage: DraxConfig.getOrLoad(EmailLayoutConfig.headerImage),
                    headerImageStyle: DraxConfig.getOrLoad(EmailLayoutConfig.headerImageStyle),
                    headerTitle: DraxConfig.getOrLoad(EmailLayoutConfig.headerTitle),
                    headerTitleStyle: DraxConfig.getOrLoad(EmailLayoutConfig.headerTitleStyle),
                    headerLogo: DraxConfig.getOrLoad(EmailLayoutConfig.headerLogo),
                    headerLogoStyle: DraxConfig.getOrLoad(EmailLayoutConfig.headerLogoStyle),
                    footerBgColor: DraxConfig.getOrLoad(EmailLayoutConfig.footerBgColor),
                    footerCopyright: DraxConfig.getOrLoad(EmailLayoutConfig.footerCopyright),
                    footerContent: DraxConfig.getOrLoad(EmailLayoutConfig.footerContent),
                    footerUnsubscribe: DraxConfig.getOrLoad(EmailLayoutConfig.footerUnsubscribe),
                }


        return Object.fromEntries(
            Object.entries(options).filter(([_, value]) =>
                value !== undefined && value !== null && value !== ''
            )
        );
    }
}

export default EmailLayoutServiceFactory
export {
    EmailLayoutServiceFactory
}

