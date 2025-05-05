// controllers/chatController.js
const { users, chats } = require("../stubData/db");
const { v4: uuid } = require("uuid");

const getUserChats = (req, res) => {
    const userId = req.user._id;
    const userChats = chats.filter(chat => chat.members.includes(userId));
    res.json(userChats);
};

const getAllUsers = (req, res) => {
    const userId = req.user._id;
    const otherUsers = users.filter(u => u._id !== userId);
    res.json(otherUsers);
};

const startChat = (req, res) => {
    const { recipientId } = req.body;
    const userId = req.user._id;

    // Prevent duplicate chat
    let chat = chats.find(
        c =>
            c.members.includes(userId) &&
            c.members.includes(recipientId)
    );

    if (!chat) {
        chat = {
            _id: uuid(),
            members: [userId, recipientId],
            messages: []
        };
        chats.push(chat);
    }

    res.status(201).json(chat);
};

module.exports = { getUserChats, getAllUsers, startChat };
