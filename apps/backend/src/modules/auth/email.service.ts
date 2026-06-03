import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import process from 'process';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private logger = new Logger(EmailService.name);

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.warn('SMTP not configured - falling back to console output');
      this.logger.log(`To: ${to}\nSubject: ${subject}\n${html}`);
      return;
    }

    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM || 'La Fete <noreply@lafete.com>',
      to,
      subject,
      html,
    });
  }
}
