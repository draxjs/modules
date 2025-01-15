import nodemailer from 'nodemailer';

import type {Transporter, SendMailOptions} from "nodemailer";
import type {TransportGmailConfig, TransportSmtpConfig} from "../interfaces/ITransportConfig";


class EmailTransportService {

    transporter: Transporter;
    transporterConfig : TransportGmailConfig | TransportSmtpConfig;

    constructor(type: 'smtp' | 'gmail', config: TransportGmailConfig | TransportSmtpConfig) {
        this.transporterConfig = config;
        switch (type) {
            case 'smtp':
                this.prepareTransportSmtp(config as TransportSmtpConfig);
                break;
            case 'gmail':
                this.prepareTransportGmail(config as TransportGmailConfig);
                break;
            default:
                throw new Error(`Unsupported email service type: ${type}`)
        }
    }


    prepareTransportGmail(config: TransportGmailConfig): any {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.auth.user,
                pass: config.auth.pass
            }
        });
    }


    prepareTransportSmtp(config: TransportSmtpConfig): any {
        this.transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            ignoreTLS: config.ignoreTLS,
            auth: (config.auth.user && config.auth.pass) ? {
                type: config.auth.type ? config.auth.type : 'login',
                user: config.auth.user,
                pass: config.auth.pass
            } : null
        });
    }


    sendEmail(options: SendMailOptions): Promise<any> {

        if(!this.transporter){
            throw new Error('Transporter is not initialized')
        }

        if(!options.to){
            throw new Error('No recipient provided')
        }

        if(!options.html && !options.text){
            throw new Error('Either HTML or TEXT content is required')
        }

        if(!options.subject){
            throw new Error('No subject provided')
        }

        if(!options.from){
            options.from = this.transporterConfig.auth.user
        }

        return this.transporter.sendMail(options);
    }

}

export default EmailTransportService
export {EmailTransportService}
