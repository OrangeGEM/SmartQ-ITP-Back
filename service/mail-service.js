const nodemailer = require('nodemailer');
const config = require('config');

async function sendActivationMail(to, link) {
    const transporter = nodemailer.createTransport({
        service: config.get('SMTP_SERVICE'),
        auth: {
            user : config.get('SMTP_USER'),
            pass: config.get('SMTP_PASSWORD')
        },
    })

    await transporter.sendMail({
        from: config.get('SMTP_USER'),
        to,
        subject: `Активация аккаунта: \n ${config.get('API_URL')}`,
        text: '',
        html: 
                `
                    <div>
                        <h1> Активация аккаунта </h1>
                        <a href="${link}"> ${link} </a>
                    </div>
                `
    }, (error, info) => {
        if(error) {
            console.log(error);
        } else {
            console.log('Email send' + info.response);
        }
    });

}

module.exports = { sendActivationMail };