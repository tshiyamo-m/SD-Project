const mongoose = require('mongoose')

const Schema = mongoose.Schema //function to create a new schema

const FinanceSchema = new Schema({//Layout of schema

    amount: {
        type: Number,
        required: true
    },
    used : {
        type: Number,
        required : true
    },
    userId: {
        type: String,
        required: true
    },
    source: {
        type: String
    },
    purpose: {
        type: String
    }



}, { timestamps : true } )

module.exports = mongoose.model('Finance', FinanceSchema, 'Finance')