import {IEmailLayout} from "../interfaces/IEmailLayout";


class EmailLayoutService {

    options: IEmailLayout

    constructor(options: IEmailLayout = {}) {
        const defaultOptions: IEmailLayout = {
            bodyStyle: 'font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #fcfcfc;',
            maxWidth: "800px",
            headerCentered: true,
            headerBgColor: "#f4f4f4",
            headerColor: "#111111",
            headerImage: "",
            headerImageStyle: "width: auto; height: auto; display: block; margin: 0 auto;",
            headerTitle: "",
            headerTitleStyle: "font-size: 28px; color: #333333; margin: 10px; font-weight: 700; display: inline-block;",
            headerLogo: "",
            headerLogoStyle: "max-height: 50px; display: block; margin: 10px auto;",
            footerBgColor: "#f4f4f4",
            footerCopyright: "Your Company. All rights reserved.",
            footerContent: "",
            footerUnsubscribe: "",
        };
        this.options = { ...defaultOptions, ...options };
    }

    get head() {
        return `<head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>`
    }

    get header() {
        let header = `<tr style="background-color: ${this.options.headerBgColor}">
        <td style="${this.options.headerCentered ? 'text-align: center;' : ''} vertical-align: middle;">`

        if (this.options.headerImage) {
            header += `<img src="${this.options.headerImage}" 
                            alt="${this.options.headerTitle}" 
                            style="${this.options.headerImageStyle}"
                        />`
        } else if (this.options.headerLogo && this.options.headerTitle) {
            header += `<table style="display: inline-table; text-align: left;">
                        <tr>
                          <td style="vertical-align: middle; padding: 10px;">
                            <img src="${this.options.headerLogo}" 
                                 alt="${this.options.headerTitle}" 
                                 style="${this.options.headerLogoStyle}" 
                            />
                          </td>
                          <td style="vertical-align: middle;">
                            <h1 style="${this.options.headerTitleStyle}">${this.options.headerTitle}</h1>
                          </td>
                        </tr>
                      </table>`
        } else if (this.options.headerTitle) {
            header += `<h1 style="${this.options.headerTitleStyle}"
                       >
                            ${this.options.headerTitle}
                       </h1>`
        }else if (this.options.headerLogo) {
            header += `<img src="${this.options.headerLogo}" alt="${this.options.headerTitle}" 
                            style="${this.options.headerLogoStyle}" 
                        />`
        }
        header += `</td></tr>`
        return header
    }

    get footer() {
        let footer = `<tr style=" ${this.options.footerBgColor ? 'background-color:'+this.options.footerBgColor : ''}">
        <td style="text-align: center; padding: 20px; font-size: 12px; color: #888888;">`

        if (this.options.footerCopyright) {
            footer += ` <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${this.options.footerCopyright}</p>`
        }

        if (this.options.footerContent) {
            footer += `${this.options.footerContent}`
        }

        if (this.options.footerUnsubscribe) {
            footer += `${this.options.footerUnsubscribe}`
            //footer += `<p style="margin: 5px 0 0 0;">Si no deseas recibir nuestros correos, <a href="${this.options.unsubscribeLink}" target="_blank" style="color: #555555; text-decoration: none;">haz clic aquí</a> para darte de baja.</p>`
        }

        footer += `</td></tr>`

        return footer
    }

    html(body: string) {
        return `<!DOCTYPE html>
            <html lang="es">
            ${this.head}
          <body style="${this.options.bodyStyle}">
            <table role="presentation" 
                   style="border-spacing: 0;  margin: 0 auto; width: 100%; max-width: ${this.options.maxWidth}"
            >
            
                <!-- HEADER -->
                ${this.header}
                <!-- BODY -->
                <tr>
                    <td style="padding: 20px; background-color: #ffffff;">
                        ${body}
                    </td>
                </tr>
                <!-- FOOTER -->
                ${this.footer}
            </table>
            </body>`
    }


}


export default EmailLayoutService
export {EmailLayoutService}
