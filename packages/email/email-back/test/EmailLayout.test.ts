import {describe, test} from "vitest";
import {EmailLayoutService} from '../src/services/EmailLayoutService.js'
import {EmailService} from '../src/services/EmailService.js'
import previewEmail from 'preview-email';
import {fileURLToPath} from "url";
import path from "path";


let body = `
        <h2 style="font-size: 22px; color: #333333; font-weight: 600; margin: 0 0 10px 0;">Bienvenido a Nuestro Boletín</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #555555; margin: 0 0 15px 0;">Hola, nos complace anunciarte nuestras últimas novedades. En este correo te mantendremos actualizado sobre todos nuestros productos y servicios. Gracias por formar parte de nuestra comunidad.</p>
        <p style="font-size: 16px; line-height: 1.6; color: #555555; margin: 0;">Si tienes alguna duda, no dudes en contactarnos. Estamos aquí para ayudarte.</p>
        `

//I Need the absolute path of template.pug file in the same directory as this file with nodejs 20 and type module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatePath = path.join(__dirname, 'template.pug');

describe("Email Layout", function () {


    test("Email Layout Preview Image", async () => {

        let emailLayoutService = new EmailLayoutService({
            headerCentered: true,
            headerImage: 'https://media.sondeosglobal.com/media/files/cincarnato/2025/1/bannerdrax-rsDnbj.png',
            headerImageStyle: 'height: 170px; width: auto; display: block; margin: auto;',
            footerCopyright: 'My Company. Todos los derechos reservados.',
            footerUnsubscribe: '<a>Unsuscribe</a>'
        })

        const mail = {
            from: 'from@example.com',
            to: 'to@example.com',
            subject: 'the subject',
            html: emailLayoutService.html(body),
            text: '',

        }

        const r = await previewEmail(mail,{ template: templatePath})

        console.log("R", r)

    })

    test("Email Layout Preview Logo Title", async () => {

        let emailLayoutService = new EmailLayoutService({
            maxWidth: '900px',
            headerCentered: false,
            headerBgColor: 'red',
            headerTitle: 'Example',
            headerTitleStyle: 'color: yellow; font-size: 28px; margin: 0; font-weight: 700;',
            headerLogo: 'https://media.sondeosglobal.com/media/files/cincarnato/2023/11/sndlogo-H31daC.png',
            headerLogoStyle: 'height: 70px; width: auto; display: block; margin: auto;',
            footerBgColor: 'cyan',
            footerCopyright: 'My Company. Todos los derechos reservados.',
            footerContent: '<p>Some Text here.</p>',
            footerUnsubscribe: '<a href="/">Unsuscribe</a>'
        })


        const mail = {
            from: 'from@example.com',
            to: 'to@example.com',
            subject: 'the subject',
            html: emailLayoutService.html(body),
            text: ''
        }

        const r = await previewEmail(mail,{ template: templatePath})

        console.log("R", r)

    })

    test("Email Layout Preview Logo Title default style", async () => {

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

        const r = await previewEmail(mail,{ template: templatePath})

        console.log("R", r)

    })

    test("Email Layout Preview Logo", async () => {

        let emailLayoutService = new EmailLayoutService({
            maxWidth: '900px',
            headerCentered: false,
            headerBgColor: 'red',
            headerColor: 'yellow',
            headerLogo: 'https://media.sondeosglobal.com/media/files/cincarnato/2023/11/sndlogo-H31daC.png',
            footerBgColor: 'cyan',
            footerCopyright: 'My Company. Todos los derechos reservados.',
            footerContent: '<p>Some Text here.</p>',
            footerUnsubscribe: '<a href="/">Unsuscribe</a>'
        })


        const mail = {
            from: 'from@example.com',
            to: 'to@example.com',
            subject: 'the subject',
            html: emailLayoutService.html(body),
            text: ''
        }

        const r = await previewEmail(mail,{ template: templatePath})

        console.log("R", r)

    })

    test("Email Layout Preview Title", async () => {

        let emailLayoutService = new EmailLayoutService({
            maxWidth: '900px',
            headerCentered: false,
            headerBgColor: 'red',
            headerColor: 'yellow',
            headerTitle: 'Example',
            footerBgColor: 'cyan',
            footerCopyright: 'My Company. Todos los derechos reservados.',
            footerContent: '<p>Some Text here.</p>',
            footerUnsubscribe: '<a href="/">Unsuscribe</a>'
        })


        const mail = {
            from: 'from@example.com',
            to: 'to@example.com',
            subject: 'the subject',
            html: emailLayoutService.html(body),
            text: ''
        }

        const r = await previewEmail(mail,{ template: templatePath})

        console.log("R", r)

    })

    test("Email Layout send", async () => {

        let emailLayoutService = new EmailLayoutService({
            headerCentered: false,
            headerImage: 'https://media.sondeosglobal.com/media/files/cincarnato/2025/1/banner-lZEeQe.png',
            headerTitle: 'Example',
            headerLogo: 'https://media.sondeosglobal.com/media/files/cincarnato/2023/11/sndlogo-H31daC.png',
            footerCopyright: 'My Company. Todos los derechos reservados.',
            footerContent: '<p>Some Text here.</p>',
            footerUnsubscribe: '<a href="/">Unsuscribe</a>'
        })


        let emailService = new EmailService('gmail', {
            auth: {
                user: process.env.EMAIL_AUTH_USERNAME,
                pass: process.env.EMAIL_AUTH_PASSWORD
            }
        })

        const r = await emailService.sendEmail({
            from: 'ci.sys.virtual@gmail.com',
            to: 'cristian.cdi@gmail.com',
            subject: 'the subject',
            html: emailLayoutService.html(body),
        })

        console.log("R", r)

    })


})
