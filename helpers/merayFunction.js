import nodemailer from "nodemailer";
// Function to send OTP via email
const emailConfig = {
    service: "gmail",
    auth: {
        user: process.env.PORTAL_EMAIL,
        pass: process.env.PORTAL_PASSWORD,
    },
};

async function sendEmailOTP(mail, generatedPassword) { //krazadev asdad
    const transporter = nodemailer.createTransport(emailConfig);

    const mailOptions = {
        from: process.env.PORTAL_EMAIL,
        to: mail,   //krazadev
        subject: "Login Password",
        text: `Your Password is: ${generatedPassword} and login link is http://localhost:5173/login`,
        
    };

    try {
        await transporter.sendMail(mailOptions);
        return `OTP sent to ${mail} via email`;
    } catch (error) {
        throw `Error sending OTP to ${mail} via email: ${error}`;
    }
}

export { sendEmailOTP }