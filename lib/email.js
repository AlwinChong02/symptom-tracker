import nodemailer from 'nodemailer';

// sendEmail({ to, subject, text, html })
export async function sendEmail({ to, subject, text, html }) {
  try {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.FROM_EMAIL || 'no-reply@symptom-tracker.local';

    if (!host) {
      console.warn('Email not configured: missing SMTP_HOST');
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
    });

    await transporter.sendMail({ from, to, subject, text, html });
  } catch (err) {
    console.error('Email send error:', err);
  }
}
