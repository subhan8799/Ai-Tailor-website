const nodemailer = require('nodemailer');

// Create transporter for sending emails
// Using Gmail SMTP (recommended for production)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

console.log('Email transporter configured for:', process.env.EMAIL_USER ? 'Gmail' : 'SMTP');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('SMTP_HOST:', process.env.SMTP_HOST);

// Test the transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.log('Transporter verification failed:', error);
    } else {
        console.log('Transporter is ready to send emails');
    }
});

// Alternative: Using custom SMTP server (like Mailtrap for testing)
// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: parseInt(process.env.SMTP_PORT),
//     secure: false, // true for 465, false for other ports
//     auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASSWORD
//     }
// });

// Function to send password reset email
const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
    try {
        const mailOptions = {
            from: `"Tailor Maven" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request - Tailor Maven',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, var(--accent) 0%, #c9a84c 100%); padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0;">Tailor Maven</h1>
                        <p style="margin: 5px 0 0 0;">Password Reset Request</p>
                    </div>
                    
                    <div style="padding: 30px; background: #f9f9f9;">
                        <h2 style="color: #333;">Reset Your Password</h2>
                        <p style="color: #666; line-height: 1.6;">
                            We received a request to reset your password. Click the button below to set a new password.
                            This link will expire in 30 minutes.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="
                                display: inline-block;
                                background: linear-gradient(135deg, #c9a84c 0%, #b8941a 100%);
                                color: white;
                                padding: 12px 40px;
                                text-decoration: none;
                                border-radius: 5px;
                                font-weight: bold;
                            ">Reset Password</a>
                        </div>
                        
                        <p style="color: #666; font-size: 12px;">
                            Or copy and paste this link in your browser:
                        </p>
                        <p style="color: #0066cc; word-break: break-all; font-size: 12px;">
                            ${resetUrl}
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        
                        <p style="color: #999; font-size: 12px;">
                            If you didn't request this password reset, you can ignore this email.<br>
                            Your account is safe and your password hasn't been changed.
                        </p>
                    </div>
                    
                    <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
                        <p style="margin: 0;">© 2025 Tailor Maven. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

// Function to send welcome email
const sendWelcomeEmail = async (email, username) => {
    try {
        const mailOptions = {
            from: `"Tailor Maven" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Tailor Maven',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #c9a84c 0%, #b8941a 100%); padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0;">Welcome to Tailor Maven</h1>
                    </div>
                    
                    <div style="padding: 30px; background: #f9f9f9;">
                        <h2 style="color: #333;">Hello ${username}!</h2>
                        <p style="color: #666; line-height: 1.6;">
                            Thank you for joining Tailor Maven. We're excited to have you on board!
                        </p>
                        
                        <p style="color: #666; line-height: 1.6;">
                            You can now design your perfect bespoke suit, explore fabrics, and place orders.
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent to:', email);
        return true;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return false;
    }
};

module.exports = {
    transporter,
    sendPasswordResetEmail,
    sendWelcomeEmail
};
