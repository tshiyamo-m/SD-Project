const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const Invite = require('../../../api/invite/InviteModel');
const nodemailer = require('nodemailer');

module.exports = async function (context, req) {
    try {
        // Connect to MongoDB if not already connected
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        const { email, projectId, projectTitle } = req.body;
        const token = uuidv4();

        // Create and save the new invite
        const newInvite = new Invite({
            email,
            projectId,
            projectTitle,
            token,
        });

        await newInvite.save();

        // Create Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    
        // Construct the invite link
        const inviteLink = `${process.env.BASE_CLIENT_URL}/accept-invite?token=${token}`;

        // Email content
        const mailOptions = {
            from: `"U-Collab" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Invitation to "${projectTitle}" research project`,
            text: `Hey! You've been invited to collaborate on the "${projectTitle}" research project. Click the link below to view the project details and accept the invite:\n\n${inviteLink}`,
            html: `
                <p>Hey!</p>
                <p><strong>You've been invited to collaborate on the <em>${projectTitle}</em> research project.</strong></p>
                <p>Click the link below to view project details:</p>
                <a href="${inviteLink}" target="_blank" style="color: blue;">Accept Invite</a>
                <p>If you didn't expect this, you can ignore this message.</p>
            `
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        context.res = {
            status: 201,
            body: { message: 'Invite created successfully!', invite: newInvite }
        };
    } catch (error) {
        context.log.error(error);
        context.res = {
            status: 500,
            body: { message: 'Server error while creating invite.' }
        };
    }
};