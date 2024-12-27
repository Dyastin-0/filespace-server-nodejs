import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SERVER_EMAIL,
    pass: process.env.SERVER_EMAIL_PASSWORD,
  },
});

/**
 * Sends a plain text email.
 *
 * @param {string} to - Recipient's email address.
 * @param {string} subject - Subject of the email.
 * @param {string} text - Body of the email in plain text.
 *
 * @returns {Promise<void>} A promise that resolves when the email is sent.
 * @throws {Error} Logs an error if sending the email fails.
 */
const sendTextEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"Filespace" ${process.env.SERVER_EMAIL}`,
      to: to,
      subject: subject,
      text: text,
    });
  } catch (error) {
    console.error("Failed to send text email", error);
  }
};

/**
 * Sends an HTML email.
 *
 * @param {string} to - Recipient's email address.
 * @param {string} subject - Subject of the email.
 * @param {string} html - Body of the email in HTML format.
 *
 * @returns {Promise<void>} A promise that resolves when the email is sent.
 * @throws {Error} Logs an error if sending the email fails.
 */
const sendHtmlEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Filespace" ${process.env.SERVER_EMAIL}`,
      to: to,
      subject: subject,
      html: html,
    });
  } catch (error) {
    console.error("Failed to send html email.", error);
  }
};

export { sendTextEmail, sendHtmlEmail };
