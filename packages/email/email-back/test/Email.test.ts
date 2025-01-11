import {describe, test} from "vitest";
import {EmailLayoutService} from '../src/services/EmailLayoutService.js'
import {fileURLToPath} from "url";
import path from "path";
import {EmailServiceFactory} from "../src/factory/EmailServiceFactory.js";


let body = `
        <h2 style="font-size: 22px; color: #333333; font-weight: 600; margin: 0 0 10px 0;">Bienvenido a Nuestro Boletín</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #555555; margin: 0 0 15px 0;">Hola, nos complace anunciarte nuestras últimas novedades. En este correo te mantendremos actualizado sobre todos nuestros productos y servicios. Gracias por formar parte de nuestra comunidad.</p>
        <p style="font-size: 16px; line-height: 1.6; color: #555555; margin: 0;">Si tienes alguna duda, no dudes en contactarnos. Estamos aquí para ayudarte.</p>
        `

//I Need the absolute path of template.pug file in the same directory as this file with nodejs 20 and type module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatePath = path.join(__dirname, 'template.pug');

describe("Email Service", function () {


    test("Email Send with Preview Logo Title default style", async () => {

        // modify run configuration: --env-file .env

        let emailLayoutService = new EmailLayoutService({
            headerCentered: false,
            headerTitle: 'Example',
            headerLogo: 'https://media.sondeosglobal.com/media/files/cincarnato/2023/11/sndlogo-H31daC.png',
            footerCopyright: 'My Company. Todos los derechos reservados.',
            footerContent: '<p>Some Text here.</p>',
        })

        const mail = {
            from: 'from@example.com',
            to: 'to@example.com',
            subject: 'the subject',
            html: emailLayoutService.html(body),
            text: ''
        }

        let emailService = EmailServiceFactory.instance

        const r = await emailService.sendEmail({
            from: 'ci.sys.virtual@gmail.com',
            to: 'cristian.cdi@gmail.com',
            subject: 'the subject',
            html: emailLayoutService.html(body),
        })

        console.log("R", r)

    })

    test("Email send Image", async () => {

        // modify run configuration: --env-file .env

        let emailLayoutService = new EmailLayoutService({
            headerCentered: false,
            headerImage: 'https://media.sondeosglobal.com/media/files/cincarnato/2025/1/bannerdrax-rsDnbj.png',
            headerImageStyle: 'width: 800px; display: block; margin: 0 auto;',
            footerCopyright: 'My Company. Todos los derechos reservados.',
            footerContent: '<p>Some Text here.</p>',
            footerUnsubscribe: '<a href="/">Unsuscribe</a>'
        })


        let emailService = EmailServiceFactory.instance

        const r = await emailService.sendEmail({
            from: 'ci.sys.virtual@gmail.com',
            to: 'cristian.cdi@gmail.com',
            subject: 'the subject',
            html: emailLayoutService.html(body),
        })

        console.log("R", r)

    })


})
