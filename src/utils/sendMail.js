
// import nodemailer from 'nodemailer';

// import { SMTP } from '../contacts/sortIndex.js';
// import { getEnvVar} from '../utils/getEnvVar.js';

// const transporter = nodemailer.createTransport({
//   host: getEnvVar(SMTP.SMTP_HOST),
//   port: Number(getEnvVar(SMTP.SMTP_PORT)),
//   auth: {
//     user: getEnvVar(SMTP.SMTP_USER),
//     pass: getEnvVar(SMTP.SMTP_PASSWORD),
//   },
// });

// export const sendEmail = async (options) => {
//   return await transporter.sendMail(options);
// };


import axios from 'axios';
import { getEnvVar } from './getEnvVar.js';
import { API_BREVO } from '../contacts/sortIndex.js';

export const sendEmail = async ({ from, to, subject, html }) => {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { email: from ?? getEnvVar(API_BREVO.API_BREVO_FROM) },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          'api-key': getEnvVar(API_BREVO.API_BREVO_KEY),
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error('Brevo API error:', error.response?.data || error.message);
    throw new Error('Email send failed');
  }
};