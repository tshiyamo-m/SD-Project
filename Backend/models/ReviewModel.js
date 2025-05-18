const mongoose = require('mongoose')

const Schema = mongoose.Schema //function to create a new schema

const ReviewSchema = new Schema({//Layout of schema

    projectId: {
        type: String,
        required: true
    },

    reviewerId: {
        type: String,
        required: true
    },

    rating: {
        type: Number,
        required: false
    },

    comment: {
        type: String,
        required: false
    },

    date: {
        type: String,
        required: false
    },

    type: {
        type: String,
        required: false
    },

}, { timestamps : true } )

module.exports = mongoose.model('Review', ReviewSchema, 'Review')