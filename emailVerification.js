const nodemailer = require("nodemailer");
require("dotenv").config();

// let mailTransporter = nodemailer.createTransport({
//   service: "gmail",
//   //host: 'myhost',
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.user,
//     pass: process.env.pass,
//   },
// });
// async function emailVerification(token, email) {
// let mailDetails = {
//   from: "jigneshkapadia27@gmail.com",
//   to: `${email}`,
//   subject: "Google Drive: Two step verification",
//   text: `click on the link to verify account
//   https://amazon-clone-back.herokuapp.com/register/confirmation/${token}`,
// };
// await mailTransporter.sendMail(mailDetails, function (err, data) {
//   if (err) {
//     console.log(err);
//     return err;
//   } else {
//     console.log("email sent");
//     return "1";
//   }
// });
// }

// function resetPassword(token, email) {
// let mailTransporter = nodemailer.createTransport({
//   service: "gmail",
//   //host: 'myhost',
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.user,
//     pass: process.env.pass,
//   },
// });
// let mailDetails = {
//   from: "jigneshkapadia27@gmail.com",
//   to: `${email}`,
//   subject: "Google Drive: Reset Password",
//   text: `click on the link to reset password
//      https://amazon-clone-front.herokuapp.com/reset-password/${token}`,
// };
// mailTransporter.sendMail(mailDetails, function (err, data) {
//   if (err) {
//     console.log(err);
//     return err;
//   } else {
//     console.log("email sent");
//     return "1";
//   }
// });
// }

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
    subject: "Google Drive: Two step verification",
    text: `click on the link to verify account
    https://amazon-clone-back.herokuapp.com/register/confirmation/${token}`,
  };
  smtpTransport.sendMail(mailOptions, (error, response) => {
    error ? console.log(error) : console.log(response);
    smtpTransport.close();
  });
}

const mailOptions = {
  from: "jigneshkapadia27@gmail.com",
  to: "aniketdevarkar98@gmail.com",
  subject: "Node.js Email with Secure OAuth",
  generateTextFromHTML: true,
  html: "<b>test</b>",
};

function resetPassword(token, email) {
  let mailOptions = {
    from: "jigneshkapadia27@gmail.com",
    to: `${email}`,
    subject: "Google Drive: Reset Password",
    text: `click on the link to reset password
       https://amazon-clone-front.herokuapp.com/reset-password/${token}`,
  };
  smtpTransport.sendMail(mailOptions, (error, response) => {
    error ? console.log(error) : console.log(response);
    smtpTransport.close();
  });
}

module.exports = { emailVerification, resetPassword };
