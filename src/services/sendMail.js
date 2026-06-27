const {Resend} = require("resend")


const resend = new Resend(process.env.EMAIL_SECRET)

async function sendMail(toUserEmail, subject, html){
    try {
        await resend.emails.send({
        from:"Acme <onboarding@resend.dev>",
        to:[toUserEmail],
        subject,
        html
    })

    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
    
}

module.exports = {
    sendMail
}

