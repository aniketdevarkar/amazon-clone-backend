const nodemailer = require("nodemailer");
require("dotenv").config();

function emailVerification(token, email) {
  let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.user,
      pass: process.env.pass,
    },
  });

  let mailDetails = {
    from: "jigneshkapadia27@gmail.com",
    to: `${email}`,
    subject: "Amazon Clone: Two step verification",
    text: `click on the link to verify account
    https://amazon-clone-back.herokuapp.com/register/confirmation/${token}`,
  };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log(err);
      return err;
    } else {
      console.log("email sent");
      return "1";
    }
  });
}

function resetPassword(token, email) {
  let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.user,
      pass: process.env.pass,
    },
  });

  let mailDetails = {
    from: "jigneshkapadia27@gmail.com",
    to: `${email}`,
    subject: "Amazon Clone: Reset Password",
    text: `click on the link to reset password
       https://amazonclone-aniket.netlify.app/reset-password/${token}`,
  };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log(err);
      return err;
    } else {
      console.log("email sent");
      return "1";
    }
  });
}

module.exports = { emailVerification, resetPassword };
