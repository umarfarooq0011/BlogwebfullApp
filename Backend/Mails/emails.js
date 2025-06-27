import { VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailsTemplate.js";
import { transporter } from "./nodemailer.config.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { getSubscriptionTemplate, getNewPostTemplate } from './emailsTemplate.js';

// Get the directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define mailOptions here
const mailOptions = {
  from: process.env.GMAIL_USER, // Sender address
  // 'to', 'subject', and 'html' will be defined for each email type
};

export const sendVerificationEmail = async (email, code, name) => {
  // Path to logo relative to this file
  const logoPath = path.join(
    __dirname,
    "../../frontend/public/assets/logo.png"
  );

  const mailOptions = {
    from: `"InsightSphere" <${process.env.GMAIL_USER} >`,
    to: email,
    subject: "Email Verification Code",
    html: VERIFICATION_EMAIL_TEMPLATE(code, name),
  
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw new Error("Failed to send verification email.");
  }
};

export const sendWelcomeEmail = async (email, name="User") => {
  // Path to logo relative to this file
  const logoPath = path.join(
    __dirname,
    "../../frontend/public/assets/logo.png"
  );

  const mailOptions = {
    from: `"InsightSphere" <${process.env.GMAIL_USER} >`,
    to: email,
    subject: "Welcome to InsightSphere",
    html: WELCOME_EMAIL_TEMPLATE(name),
    attachments: [
      {
        filename: "logo.png",
        path: logoPath,
        cid: "logo", // Content ID referenced in the HTML
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw new Error("Failed to send welcome email.");
  }
};


export const sendPasswordResetEmail = async (email, resetLink) => {
  // Path to logo relative to this file
  const logoPath = path.join(
    __dirname,
    "../../frontend/public/assets/logo.png"
  );
  
  const mailOptions = {
    from: `"InsightSphere" <${process.env.GMAIL_USER} >`,
    to: email,
    subject: "Password Reset Request",
    html: PASSWORD_RESET_REQUEST_TEMPLATE(resetLink),
    attachments: [
      {
        filename: "logo.png",
        path: logoPath,
        cid: "logo", // Content ID referenced in the HTML
      },
    ],
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw new Error("Failed to send password reset email.");
  }
}


export const sendResetSuccessEmail = async (email, name= "User") => {
  const logoPath = path.join(
    __dirname,
    "../../frontend/public/assets/logo.png"
  );
  const mailOptions = {
    from: `"InsightSphere" <${process.env.GMAIL_USER} >`,
    to: email,
    subject: "Password Reset Success",
    html: PASSWORD_RESET_SUCCESS_TEMPLATE(name),
    attachments: [
      {
        filename: "logo.png",
        path: logoPath,
        cid: "logo", // Content ID referenced in the HTML
      },
    ],
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw new Error("Failed to send reset success email.");
  }
}

// Function to send a "thank you for subscribing" email
export const sendSubscriptionEmail = async (userEmail) => {
  try {
    await transporter.sendMail({
      ...mailOptions,
      to: userEmail,
      subject: 'Subscription Confirmation',
      html: getSubscriptionTemplate(),
    });
  } catch (error) {
    console.error('Error sending subscription email:', error);
  }
};

// Function to send a "new post" notification to a list of subscribers
export const sendNewPostEmail = async (recipientEmails, post) => {
  if (!recipientEmails || recipientEmails.length === 0) {
    return;
  }
  
  try {
    // Use BCC to send to all subscribers without revealing their emails to each other
    await transporter.sendMail({
      ...mailOptions,
      to: process.env.GMAIL_USER, // A dummy "to" address
      bcc: recipientEmails,
      subject: `New Post: ${post.title}`,
      html: getNewPostTemplate(post),
    });
    console.log(`New post email sent to ${recipientEmails.length} subscribers.`);
  } catch (error) {
    console.error('Error sending new post email:', error);
  }
};