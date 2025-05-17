const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Invite = require('../../../api/invite/InviteModel'); // Import your Invite model
const router = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

// POST route to create an invite
router.post('/api/invite', async (req, res) => {
    try {
        const { email, projectId, projectTitle } = req.body;//Takes email and projectID from the request body

        const token = uuidv4(); // Generate a unique token

        const newInvite = new Invite({//Create and save the new invite to MongoDB
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
    
        // Construct the invite link (could route them to a login/signup page)
        const inviteLink = `${process.env.BASE_CLIENT_URL}/accept-invite?token=${token}`;

        // Email content
        const mailOptions = {
        from: `"U-Collab" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Invitation to "${projectTitle}" research project`,
        text: `Hey! You've been invited to collaborate on the "${projectTitle}" research project. Click the link below to view the project details and accept the invite:\n\n${inviteLink}`,
        html: `
            <p>Hey!</p>
            <p><strong>You’ve been invited to collaborate on the <em>${projectTitle}</em> research project.</strong></p>
            <p>Click the link below to view project details:</p>
            <a href="${inviteLink}" target="_blank" style="color: blue;">Accept Invite</a>
            <p>If you didn’t expect this, you can ignore this message.</p>
        `
        };

    // Send the email
    await transporter.sendMail(mailOptions);
        res.status(201).json({ message: 'Invite created successfully!', invite: newInvite });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while creating invite.' });
    }
});

module.exports = router;
