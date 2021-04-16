const nodemailer = require("nodemailer");
require("dotenv").config();

const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.CLIENT_ID, // ClientID
  process.env.CLIENT_SECRET, // Client Secret
  "https://developers.google.com/oauthplayground" // Redirect URL
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});
const accessToken = oauth2Client.getAccessToken();

const smtpTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "jigneshkapadia27@gmail.com",
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken: accessToken,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

function emailVerification(token, email) {
  let mailOptions = {
    from: "jigneshkapadia27@gmail.com",
    to: `${email}`,
    subject: "Amazon Clone: Two step verification",
    text: `click on the link to verify account
    https://amazon-clone-back.herokuapp.com/register/confirmation/${token}`,
  };
  smtpTransport.sendMail(mailOptions, (error, response) => {
    error ? console.log(error) : console.log(response);
    smtpTransport.close();
  });
}

async function resetPassword(token, email) {
  let mailOptions = {
    from: "jigneshkapadia27@gmail.com",
    to: `${email}`,
    subject: "Amazon Clone: Reset Password",
    text: `click on the link to reset password
       https://amazon-clone-front.herokuapp.com/reset-password/${token}`,
  };
  smtpTransport.sendMail(mailOptions, (error, response) => {
    error ? console.log(error) : console.log(response);
    smtpTransport.close();
  });
}

module.exports = { emailVerification, resetPassword };
