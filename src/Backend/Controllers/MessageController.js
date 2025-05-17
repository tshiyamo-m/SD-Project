// controllers/messageController.js
//const { chats, messages } = require("../stubData/db");
const { v4: uuid } = require("uuid");
const ConversationModel = require('../models/ConversationModel');
const { CreativeCommons } = require("lucide-react");
const MessageModel = require('../models/MessagesModel');
const LoginModel = require('../models/LoginModel')
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types; 
const jwt = require('jsonwebtoken');




const getMessages = (req, res) => {
    // const { chatId } = req.params;
    // const chatMessages = messages.filter(msg => msg.chatId === chatId);
    // res.json(chatMessages);
    const {ConvoID} = req.body;

    if (!ConvoID) {
        return res.status(400).json({ error: "ConvoID required" });
    };

    try
    {
        const messages = MessageModel.find({ConvoID: ConvoID})

        res.status(200).json(messages);

    }
    catch(error)
    {   
        console.error("Error Retrieving Messages", error);
        res.status(404).json({error: error.message});
        console.log("FAILED to retrieve messages");        
    }

};

const sendMessage = async (req, res) => {
    
    const { text, sender, partnerID } = req.body;
    const timestamp = new Date().toISOString();

    if (!sender || !text || !partnerID) {
        return res.status(400).json({ error: "Both iDs and text required" });
    }

 
    try{
        const existingConversation = await ConversationModel.findOne({
            $or: [
                { userID_1: sender, userID_2: partnerID },
                { userID_1: partnerID, userID_2: sender }
            ]
        });
        //const convo = await ConversationModel.findById(ConvoID)

        if (!existingConversation) {throw new Error}

        else{
            const ConvoID = existingConversation._id;
            const message = await MessageModel.create({ConvoID, text, sender, timestamp});

            const updatedConvo = await ConversationModel.findByIdAndUpdate(
                ConvoID,
                { $set: { lastMessageID: message._id } },
                { new: true } // Return the updated document
            );
            res.status(200).json(message);
        }

    }
    catch(error){
        console.error("Error Sending Message", error);
        res.status(400).json({error: error.message});
        console.log("FAILED to send message");
    }
};

const createConversation = async (req, res) => {

    const { userID_1, userID_2} =  req.body;

    if (!userID_1 || !userID_2) {
        return res.status(400).json({ error: "Both user IDs are required" });
    }

    if (userID_1 === userID_2) {
        return res.status(400).json({ error: "Cannot create conversation with yourself" });
    }

    try{
        const existingConversation = await ConversationModel.findOne({
            $or: [
                { userID_1: userID_1, userID_2: userID_2 },
                { userID_1: userID_2, userID_2: userID_1 }
            ]
        });
        const lastMessageID = "";

        if (existingConversation) {
            console.log("Existing conversation found:", existingConversation._id);
            return res.status(200).json({
                message: "Conversation already exists",
                conversation: existingConversation
            });
        }

        if (!existingConversation){
            const Conversation_model = await ConversationModel.create({
                userID_1,
                userID_2,
                lastMessageID: null
            })
            console.log("New Conversation Created!");

            res.status(201).json(Conversation_model);
        }
        
        else{
            res.status(200).json(existingChatters);
            console.log("Conversation Found! : ", existingChatters);
        }

    }
    catch(error){
        console.error("Error creating Conversation", error);
        res.status(400).json({error: error.message});
        console.log("FAILED to create Conversation");
    }
}

const retrieveConversations = async (req, res) => {

    const { userID } =  req.body;

    if (!userID) {
        return res.status(400).json({ error: "user ID is required" });
    }

    try{
        const existingChatters = await ConversationModel.find({
            $or: [
                { userID_1: userID},
                { userID_2: userID}
            ]
        });
        
        if (!existingChatters || existingChatters.length === 0){           
            console.log("Could Not Find Conversations");
            return res.status(200).json([]);
        }
        else{

            const enrichedConversations = await Promise.all(
                existingChatters.map(async (chat) => {
                    const messages = await MessageModel.find({ConvoID: chat._id});
                    return {
                        ...chat.toObject(),
                        Messages: messages || null
                    };
                })
            );

            res.status(200).json(enrichedConversations);
            console.log("Conversations Found! "/*, enrichedConversations*/);
        }

    }
    catch(error){
        console.error("Error creating Conversation", error);
        res.status(400).json({error: error.message});
        console.log("FAILED to create Conversation");
    }
}

const get_chatters = async (req, res) => {

    const { _id } = req.body;
    try {
        const Users = await LoginModel.find(
            { _id: { $ne: new mongoose.Types.ObjectId(req.body._id) } }
        ).lean(); // .lean() converts Mongoose documents into plain JavaScript objects.

        const users = {};

        for (const user of Users){
            if (user.token){
                const decodedUser = jwt.decode(user.token);

                users[user._id] = {_id: user._id.toString(), name: decodedUser.name, email: decodedUser.email}
            }
        }

        res.status(200).json(users);

    }
    catch(error) {
        res.status(400).json({error: error.message});
        console.log("Could Not Find Users!")
    }
}

const fetchConversation = async (req, res) => {

    const { userID_1, userID_2} =  req.body;

    if (!userID_1 || !userID_2) {
        return res.status(400).json({ error: "Both user IDs are required" });
    }

    if (userID_1 === userID_2) {
        return res.status(400).json({ error: "Cannot create conversation with yourself" });
    }

    try{
        const existingConversation = await ConversationModel.findOne({
            $or: [
                { userID_1: userID_1, userID_2: userID_2 },
                { userID_1: userID_2, userID_2: userID_1 }
            ]
        }).select('_id').lean();;

        return res.status(200).json({conversationId: existingConversation._id})
        
    }
    catch (error) {
        console.error("Error fetching conversation:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}



module.exports = { getMessages, sendMessage, createConversation, retrieveConversations, get_chatters, fetchConversation };
