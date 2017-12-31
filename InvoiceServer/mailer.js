'use strict';
const nodemailer = require('nodemailer');
const config = require("./config.js");

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport(config.mailserver);


module.exports = {
    sendEmail: function (emailTo, subject, message) {

        // setup email data with unicode symbols
        let mailOptions = {
            from: config.mailserver.defaultFrom, // sender address
            to: emailTo, // list of receivers
            subject: subject, // Subject line
            text: '', // plain text body
            html: message // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);            
        });
    }

}
