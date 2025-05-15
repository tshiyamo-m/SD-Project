const request = require('supertest');
const express = require('express');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const Invite = require('../../../api/invite/InviteModel'); // Import your Invite model
const router = require('../../../path-to-your-router-file'); // Update this path
const app = express();

// Middleware to parse JSON requests
app.use(express.json());
app.use(router); // Your express route

// Mock Invite model
jest.mock('../../../api/invite/InviteModel');

// Mock Nodemailer
jest.mock('nodemailer');

describe('POST /api/invite', () => {
    it('should create an invite and send an email successfully', async () => {
        const mockEmail = 'test@example.com';
        const mockProjectId = '12345';
        const mockProjectTitle = 'Research Project A';

        // Mock Invite model to simulate saving an invite
        const mockInvite = {
            email: mockEmail,
            projectId: mockProjectId,
            projectTitle: mockProjectTitle,
            token: 'mock-token',
            save: jest.fn().mockResolvedValue(true),
        };

        Invite.mockImplementation(() => mockInvite); // Mock the Invite constructor

        // Mock nodemailer to simulate sending an email
        const mockSendMail = jest.fn().mockResolvedValue('Email sent successfully');
        nodemailer.createTransport.mockReturnValue({
            sendMail: mockSendMail,
        });

        const response = await request(app)
            .post('/api/invite')
            .send({
                email: mockEmail,
                projectId: mockProjectId,
                projectTitle: mockProjectTitle,
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Invite created successfully!');
        expect(response.body.invite.email).toBe(mockEmail);
        expect(response.body.invite.projectId).toBe(mockProjectId);
        expect(response.body.invite.projectTitle).toBe(mockProjectTitle);
        expect(response.body.invite.token).toBeDefined(); // token should be generated
        expect(mockInvite.save).toHaveBeenCalledTimes(1); // Check that save was called once
        expect(mockSendMail).toHaveBeenCalledTimes(1); // Check that sendMail was called once

        // Validate that the email was sent with correct data
        const mailOptions = mockSendMail.mock.calls[0][0]; // Get the first argument passed to sendMail
        expect(mailOptions.to).toBe(mockEmail);
        expect(mailOptions.subject).toBe(`Invitation to "${mockProjectTitle}" research project`);
        expect(mailOptions.html).toContain(mockProjectTitle); // The email body should contain the project title
    });

    it('should return an error if invite creation fails', async () => {
        // Simulate an error when saving the invite
        Invite.mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const response = await request(app)
            .post('/api/invite')
            .send({
                email: 'test@example.com',
                projectId: '12345',
                projectTitle: 'Research Project A',
            });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Server error while creating invite.');
    });

    it('should return a 400 error if required fields are missing', async () => {
        const response = await request(app)
            .post('/api/invite')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Email, projectId, and projectTitle are required');
    });
});
