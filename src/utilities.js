const nodemailer = require('nodemailer');

/**
 * Takes in a graphql input and redacts specified fields like passwords
 * @param {String} str Log to remove sensitive information from
 * @param {Array<String>} fields List of fields to remove
 * @return {String} Redacted log
 */
const removeSensitiveInfo = (str, fields) => {
  let newStr = str;
  for (const field of fields) {
    newStr = newStr.replace(new RegExp(`${field}: \\\\"(.*?)\\\\"`, 'gm'), `${field}: REDACTED`);
  }
  return newStr;
};

/**
 * Sends an email - must have appropriate environment variables set
 * @param {String} email Email to send the message to
 * @param {String} subject Subject of the email
 * @param {String} message Message of the email
 * @returns {Boolean} Success status of sending the email
 */
const emailUser = async (email, subject, message) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: subject,
      text: message
    });

    console.log(`Sent ${email}: ${message}`);
  } catch (e) {
    console.error(`Failed to send email ${e}`);
  }
}
;

module.exports = { removeSensitiveInfo, emailUser }
;
