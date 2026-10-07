const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '465', 10),
  secure: String(process.env.EMAIL_SECURE) === 'true',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
});

function otpEmailTemplate(otp) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;background:#0b0f1f;color:#fff;border-radius:16px">
    <h1 style="color:#38BDF8;margin:0 0 4px">NOVA</h1>
    <p style="color:#94a3b8;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 20px">by Nexus</p>
    <p style="color:#cbd5e1;margin:0 0 24px">Connect. Chat. Share. Discover.</p>
    <p>Your verification code is:</p>
    <div style="font-size:36px;letter-spacing:10px;font-weight:700;background:#111827;padding:16px;border-radius:12px;text-align:center;color:#38BDF8">${otp}</div>
    <p style="margin-top:24px;color:#94a3b8">This code expires in ${process.env.OTP_EXPIRATION_MINUTES || 5} minutes.</p>
    <p style="color:#94a3b8">If you did not request this code, you can safely ignore this email.</p>
  </div>`;
}

exports.sendOtpEmail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Nova verification code: ${otp}`,
    html: otpEmailTemplate(otp),
    text: `Your Nova verification code is ${otp}. Expires in ${process.env.OTP_EXPIRATION_MINUTES || 5} minutes.`,
  });
};