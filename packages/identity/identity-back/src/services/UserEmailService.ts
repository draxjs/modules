import {EmailTransportConfig, EmailLayoutServiceFactory, EmailTransportServiceFactory} from "@drax/email-back"
import {CommonConfig, DraxConfig} from "@drax/common-back";
import type {SendMailOptions} from "nodemailer";

class UserEmailService {

    static async emailVerifyCode(emailCode: string, emailTo:string){


        let emailLayout = EmailLayoutServiceFactory.instance

        let baseurl = DraxConfig.getOrLoad(CommonConfig.BaseUrl)

        let body = `
        <h2 style="font-size: 22px; color: #333333; font-weight: 600; margin: 0 0 10px 0;">
            Verificación de Email
        </h2>
        <p style="font-size: 16px; line-height: 1.6; color: #555555; margin: 0 0 15px 0;">
        Para confirmar tu email, haz clic en el siguiente enlace:
        </p>
        <a href="${baseurl}/api/users/verify-email/${emailCode}" style="color: #333333; text-decoration: none; border: 1px solid #333333; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block;">Verificar Email</a>
        `

        const emailFrom = DraxConfig.getOrLoad(EmailTransportConfig.authUsername)

        const emailOptions : SendMailOptions = {
            subject: "Verificación de Email",
            from: emailFrom,
            to: emailTo,
            html: emailLayout.html(body)
        }

        await EmailTransportServiceFactory.instance.sendEmail(emailOptions)

    }


    static async recoveryCode(recoveryCode: string, emailTo:string){


        let emailLayout = EmailLayoutServiceFactory.instance

        let baseurl = DraxConfig.getOrLoad(CommonConfig.BaseUrl)

        let body = `
        <h2 style="font-size: 22px; color: #333333; font-weight: 600; margin: 0 0 10px 0;">
            Recuperación de Contraseña
        </h2>
        <p style="font-size: 16px; line-height: 1.6; color: #555555; margin: 0 0 15px 0;">
        Accede al siguiente link para recuperar tu contraseña:
        </p>
        <p style="text-align: center; width: 100%;">
           <a href="${baseurl}/password/recovery/complete/${recoveryCode}" 
           style="color: #333333; text-decoration: none; border: 1px solid #333333; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block;">
           Recuperar Contraseña
            </a>
        </p>
     
        `

        const emailFrom = DraxConfig.getOrLoad(EmailTransportConfig.authUsername)

        const emailOptions : SendMailOptions = {
            subject: "Recuperación de Contraseña",
            from: emailFrom,
            to: emailTo,
            html: emailLayout.html(body)
        }

        await EmailTransportServiceFactory.instance.sendEmail(emailOptions)

    }

}

export default UserEmailService

export {UserEmailService}
