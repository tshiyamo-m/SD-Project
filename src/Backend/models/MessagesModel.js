const mongoose = require('mongoose')

const Schema = mongoose.Schema //function to create a new schema

const MessageSchema = new Schema({

    ConvoID: {
        type: String,
        required: true
    },

    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: String,
        required: false
    }

 
}, { timestamps : true } )

module.exports = mongoose.model('Messages', MessageSchema, 'Messages') 