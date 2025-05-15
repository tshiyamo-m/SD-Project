const mongoose = require('mongoose')

const Schema = mongoose.Schema //function to create a new schema

const ConversationSchema = new Schema({

    userID_1: {
        type: String,
        required: true
    },

    userID_2: {
        type: String,
        required: true
    },
    
    lastMessageID: {
        type: String,
        required: false
    }


}, { timestamps : true } )

module.exports = mongoose.model('Conversations', ConversationSchema, 'Conversations')