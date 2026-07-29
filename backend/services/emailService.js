const nodemailer = require('nodemailer');
const NotificationLog = require('../models/NotificationLog');

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransporter() {
  if (!hasSmtpConfig()) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendEmail({ to, subject, text, html, relatedMatchId = null }) {
  const from = process.env.MAIL_FROM || 'CampusFind <no-reply@campusfind.local>';
  const transporter = createTransporter();

  if (!transporter) {
    console.log('\n--- CampusFind demo email ---');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log(text);
    console.log('--- End demo email ---\n');

    await NotificationLog.create({
      type: 'match_email',
      to,
      subject,
      body: text,
      status: 'logged',
      relatedMatchId
    });
    return { sent: false, logged: true };
  }

  try {
    const info = await transporter.sendMail({ from, to, subject, text, html });
    await NotificationLog.create({
      type: 'match_email',
      to,
      subject,
      body: text,
      status: 'sent',
      relatedMatchId
    });
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    await NotificationLog.create({
      type: 'match_email',
      to,
      subject,
      body: text,
      status: 'failed',
      relatedMatchId,
      error: err.message
    });
    throw err;
  }
}

async function sendMatchNotification({ match, lostReport, foundItem }) {
  const subject = `CampusFind: Possible match found for ${lostReport.referenceNumber}`;
  const text = [
    `Hello ${lostReport.fullName},`,
    '',
    `A possible match has been found for your lost item report (${lostReport.referenceNumber}).`,
    '',
    `Reported item: ${lostReport.itemName}`,
    `Possible found item category: ${foundItem.itemCategory}`,
    `Similarity: ${match.similarity}`,
    '',
    'Please contact or visit University of Regina Protective Services with valid ID and ownership details for in-person verification.',
    '',
    'Protective Services',
    'Phone: 306-585-4407',
    'Office: Research and Innovation Centre, Room 120',
    '',
    'CampusFind Team'
  ].join('\n');

  const html = text.replace(/\n/g, '<br>');
  return sendEmail({ to: lostReport.email, subject, text, html, relatedMatchId: match._id });
}

module.exports = { sendEmail, sendMatchNotification };
