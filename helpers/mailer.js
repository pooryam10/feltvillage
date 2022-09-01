
const mailer = require('nodemailer');

exports.sendMail = (to, subject, message) => {
    const transport = mailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const option = {
        from: process.env.EMAIL_USERNAME,
        to,
        subject,
        text: message
    }

    transport.sendMail(option, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log(info);
        }
    });
}