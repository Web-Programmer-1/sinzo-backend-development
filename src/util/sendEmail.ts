import config from "../config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host:  config.mail.host,
  port: config.mail.port,
  secure: config.mail.secure,
  auth: {
    user: config.mail.user,
    pass: config.mail.pass,
  },
});

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  if (!to) return;

  await transporter.sendMail({
    from: `"${config.mail.fromName}" <${config.mail.fromEmail}>`,
    to,
    subject,
    html,
  });
};