const nodemailer = require('nodemailer');
let transporter = null;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: +process.env.SMTP_PORT || 587,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}
module.exports = async function sendMail(to, subject, text) {
  try {
    if (!transporter) return console.log(`[MAIL - SMTP not configured]\nTo: ${to}\nSubject: ${subject}\n${text}\n`);
    await transporter.sendMail({ from: process.env.MAIL_FROM || 'ShopSphere <no-reply@shopsphere.com>', to, subject, text });
  } catch (e) { console.error('Email failed:', e.message); }
};
