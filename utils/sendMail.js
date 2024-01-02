const nodemailer = require('nodemailer');

//Create a nodemailer transporter with your Gmail account
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'mvservices.tech@gmail.com',//'fcreation.tech@gmail.com',
        pass: 'wtzz lidi baql zgqn',
        //pass: 'cztyfotvdzodsbot',
    },
});

const emailMessageBody = (type, ...paras) => {
    const values = paras;
    const messages = {
        newPassword: `Hello,
We received a request to reset your password because you forgot your current password. We're here to help!
    
Your new password is: [${values[0]}]
        
Please use this new password to log in to your account. We recommend changing this password to something memorable and secure once you log in.
        
If you did not request this password reset, please ignore this email or contact our admin immediately.
     

Thank you for using our services.
            
Best regards,
MV Services Pvt Ltd.
Phone No -- 8923136015`
    }
    return messages[type]
}

const sendNewPassword = async (email, newPassword) => {
    const message = emailMessageBody('newPassword', newPassword);
    return new Promise((resolve, reject) => {
        // Compose the email message
        const mailOptions = {
            from: 'fcreation.tech@gmail.com',
            to: email,
            subject: "Your New Password",
            text: `${message}`
        };
        // Send the email using the nodemailer transporter
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject({ "status": "failed" }); // reject the promise with a failed status
            } else {
                resolve({ "status": "successfull" }); // Resolve the promise with a successful status
            }
        });
    });
}

// Function to send an email
const sendPunchOutNotifyEmail = async (recipient) => {
    const mailOptions = {
        from: 'your_email@gmail.com',
        to: recipient?.emp_emailid,
        subject: 'Notification -- Not Punch Out Yet',
        text:
            `Dear ${recipient?.emp_name},

You haven't punched out for today, Please do so.
        

Thanks & Best Regards,
HR`,
    };

    try {
        await transporter.sendMail(mailOptions);
        //console.log(`Email sent to: ${recipient.emp_name}`);
    } catch (error) {
        console.error(`Email sending failed to: ${recipient.emp_name}, ${error}`);
        // Handle the error or choose to continue to the next recipient
    }
};

module.exports = {
    sendNewPassword,
    sendPunchOutNotifyEmail
};
