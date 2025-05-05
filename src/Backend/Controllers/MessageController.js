// controllers/messageController.js
const { chats, messages } = require("../stubData/db");
const { v4: uuid } = require("uuid");
const ConversationModel = require('../models/ConversationModel');
const { CreativeCommons } = require("lucide-react");
const MessageModel = require('../models/MessagesModel');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types; 

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
    
    const { ConvoID, text } = req.body;

    if (!ConvoID || !text) {
        return res.status(400).json({ error: "Both ConvoID and text required" });
    }
    //const convoid = new mongoose.Types.ObjectId(ConvoID);
 
    try{
        const convo = await ConversationModel.findById(ConvoID)

        const timestamp = new Date().toISOString()

        if (convo){
            const message = await MessageModel.create({ConvoID, text, timestamp});

            const updatedConvo = await ConversationModel.findByIdAndUpdate(
                ConvoID,
                { $set: { lastMessageID: message._id } },
                { new: true } // Return the updated document
            );

            res.status(200).json(message);
        }
        else{
            console.log("Could not find convo");
            res.status(404).json({error: "Could not find the conversation"});
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

    try{
        const existingChatters = await ConversationModel.findOne({
            $or: [
                { userID_1: userID_1, userID_2: userID_2 },
                { userID_1: userID_2, userID_2: userID_1 }
            ]
        });
        const lastMessageID = "";
        if (!existingChatters){
            const Conversation_model = await ConversationModel.create({
                userID_1, 
                userID_2,
                lastMessageID
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
        return res.status(400).json({ error: "Both user IDs are required" });
    }

    try{
        const existingChatters = await ConversationModel.find({
            $or: [
                { userID_1: userID},
                { userID_2: userID}
            ]
        });
        
        if (!existingChatters){           
            console.log("Could Not Find Conversations");
        }
        else{

            const messages = await MessageModel.find({           
                ConvoID: existingChatters._id           
            });

            const final = {...existingChatters, messages};
            res.status(200).json(final);
            console.log("Conversations Found! : ", existingChatters);
        }

    }
    catch(error){
        console.error("Error creating Conversation", error);
        res.status(400).json({error: error.message});
        console.log("FAILED to create Conversation");
    }
}

module.exports = { getMessages, sendMessage, createConversation, retrieveConversations };
