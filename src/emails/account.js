const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.ApiKey)

const sendWelcomeEmail = (email,user) =>{
    sgMail.send({
        to: email,
        from:'varun.saral47@gmail.com',
        subject:'Thanks for joining in',
        text:`welcome ${user},We hope you will enjoy the application`
    })
}

const sendCancelationEmail = (email,name) => {
    sgMail.send({
        to: email,
        from:'varun.saral47@gmail.com',
        subject:`We are sad ${name} that you're leaving`,
        text:`We hate to say good bye ${name}, Please leave a feedback so we can serve you better in future`
    })
}
module.exports ={
    sendWelcomeEmail,
    sendCancelationEmail
}