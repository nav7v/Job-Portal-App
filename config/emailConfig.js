import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendApplicationEmail = async (toEmail, jobTitle, companyName) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: 'Job Application Confirmation',
            html: `
                <h2>Application Received</h2>
                <p>Thank you for applying to the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
                <p>We have received your application and will review it carefully. If your qualifications match our requirements, we will contact you for the next steps.</p>
                <br>
                <p>Best regards,<br>${companyName} Hiring Team</p>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Email sending failed:', error);
    }
};
