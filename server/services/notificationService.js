const axios = require("axios");
const nodemailer = require("nodemailer");


require("dotenv").config();

const POVER_CREDS = process.env.AUTH_POVER;
const POVER_HOST = process.env.AUTH_POVER_HOST;

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASSWORD;
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const ENV = process.env.NODE_ENV || "production"; // Default to production if not set

/**
 * Sends a notification via Apprise when a class is successfully booked.
 * @param {string} message - The message to send.
 */
const sendAppriseNotification = async (message) => {
    const appriseServerUrl = POVER_HOST;
    const pushoverURL = `pover://${POVER_CREDS}`;

    try {
        if(ENV === 'development') return; // Skip if in development mode
        const response = await axios.post(appriseServerUrl, {
            body: message,
            title: "Class Booking Confirmation",
            urls: [pushoverURL],
        });

        if (response.status === 200) {
            console.log("✅ Pushover notification sent successfully!");
        } else {
            console.error("⚠️ Failed to send notification:", response.data);
        }
    } catch (error) {
        console.error("❌ Error sending Apprise notification:", error.message);
    }
};

// Send email when a class is successfully booked.
//Create a reusable transporter
const transporter = nodemailer.createTransport({
    host: EMAIL_HOST , // Example: "smtp.gmail.com"
    port: EMAIL_PORT, // 465 for SSL, 587 for TLS
    secure: EMAIL_PORT == 465, // Use `true` for 465, `false` for other ports
    auth: {
        user: EMAIL_USER, 
        pass: EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false, // Prevent SSL issues
    },
});
/**
 * Sends an email notification.
 * @param {string} recipientEmail - The recipient's email address.
 * @param {string} subject - Email subject.
 * @param {string} message - Email body content.
 */
const sendEmailNotification = async (recipientEmail, subject, message, htmlContent) => {
    if(!recipientEmail){
        console.error("No recipient email provided");
        return;
    }
    try{
        const mailOptions = {
            from: `"Club Studio Scheduler" <${process.env.EMAIL_USER}>`, // sender address
            to: recipientEmail, // list of receivers
            subject: subject,
            text: message,
            html: htmlContent
        };
        const info = await transporter.sendMail(mailOptions); // send the mail
        console.log(`📧 Email sent successfully to ${recipientEmail}: ${info.messageId}`);// log the response from the tran
        
    }catch(error){
        console.error("Error sending email:", error.message);
    }
};

module.exports = { sendAppriseNotification, sendEmailNotification };