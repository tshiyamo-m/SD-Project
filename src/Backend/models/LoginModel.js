const mongoose = require('mongoose')

const Schema = mongoose.Schema //function to create a new schema

const loginSchema = new Schema({  //Layout of schema
    token: {
        type: String,
        required: true
    },
    projects: {
        type:[String],
        required: true
    },
    isReviewer: {
        type: String,
        default: "false"
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, { timestamps : true } ) //timestamp argument gives a 'date created' attribute to a document created in the db

module.exports = mongoose.model('login', loginSchema, 'Users')
