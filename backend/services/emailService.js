import nodemailer from 'nodemailer';

export const isEmailConfigured = () => Boolean(
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

const createTransporter = () => {
  if (!isEmailConfigured()) {
    const error = new Error('Gmail email delivery is not configured. Set SMTP_USER and SMTP_PASS in backend/.env.');
    error.code = 'EMAIL_NOT_CONFIGURED';
    throw error;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, text }) => {
  const transporter = createTransporter();
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `SecureShare AI <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });
  } catch (error) {
    const deliveryError = error instanceof Error ? error : new Error(String(error));
    deliveryError.smtpCode = deliveryError.code;
    deliveryError.smtpResponseCode = deliveryError.responseCode;
    deliveryError.smtpMessage = deliveryError.message;
    deliveryError.code = 'EMAIL_DELIVERY_FAILED';
    throw deliveryError;
  }
};

export const sendShareLinkEmail = async ({ to, documentName, shareUrl, expiry }) => {
  await sendEmail({
    to,
    subject: `Secure document shared with you: ${documentName}`,
    text: `A secure link to "${documentName}" was shared with you.\n\nOpen this link: ${shareUrl}\n\nThe link expires: ${new Date(expiry).toLocaleString()}.\n\nIf the link requires a password, the sender will share it with you through a separate channel. A verification code will be sent to this email address when you verify access.`,
  });
};

export const sendShareOtpEmail = async ({ to, documentName, otp }) => {
  await sendEmail({
    to,
    subject: `Your SecureShare verification code for ${documentName}`,
    text: `Your one-time verification code for "${documentName}" is ${otp}.\n\nThis code expires in 5 minutes. Do not share it with anyone.`,
  });
};

export const sendLogin2faEmail = async ({ to, userName, otp }) => {
  await sendEmail({
    to,
    subject: `SecureShare AI - Your Login Verification Code`,
    text: `Hello ${userName || 'User'},\n\nYour two-factor verification code to sign in to SecureShare AI is: ${otp}\n\nThis code expires in 5 minutes. If you did not initiate this login request, please change your password immediately.`,
  });
};

export const sendLoginNotificationEmail = async ({ to, userName, ip, device, timestamp }) => {
  await sendEmail({
    to,
    subject: `SecureShare AI - New Login Detected`,
    text: `Hello ${userName || 'User'},\n\nA new login to your SecureShare AI account was detected:\n\n• Time: ${new Date(timestamp).toLocaleString()}\n• Device / Browser: ${device || 'Web Browser'}\n• IP Address: ${ip || 'Unknown'}\n\nIf this was you, you can safely ignore this alert. If you do not recognize this activity, please revoke your sessions and reset your password immediately.`,
  });
};
