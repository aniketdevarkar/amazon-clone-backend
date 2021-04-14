const nodemailer = require("nodemailer");
require("dotenv").config();

let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  //host: 'myhost',
  port: 465,
  secure: true,
  auth: {
    user: process.env.user,
    pass: process.env.pass,
  },
});
function emailVerification(token, email) {
  let mailDetails = {
    from: "jigneshkapadia27@gmail.com",
    to: `${email}`,
    subject: "Google Drive: Two step verification",
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

  let mailDetails = {
    from: "jigneshkapadia27@gmail.com",
    to: `${email}`,
    subject: "Google Drive: Reset Password",
    text: `click on the link to reset password
       https://amazon-clone-front.herokuapp.com/reset-password/${token}`,
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
