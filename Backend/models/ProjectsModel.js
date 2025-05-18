const mongoose = require('mongoose')

const Schema = mongoose.Schema //function to create a new schema

const ProjectSchema = new Schema({//Layout of schema

    owner: {
        type: String,
        required: true
    },
    
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: false
    },

    field: {
        type: String,
        required: false
    },

    collaborators: {
        type: [String],
        required: false
    },

    requirements: {
        type: String,
        required: false
    },

    fundingAmount: {
        type: String,
        required: false
    },

    fundingSource: {
        type: String,
        required: false
    },

    startDate: {
        type: String,
        required: false
    },

    endDate: {
        type: String,
        required: false
    },

    status: {
        type: String,
        required: true,
        default: 'Planning'
    },

    tags: {
        type: [String],
        required: false
    },

    skills: {
        type: [String],
        required: false
    }

}, { timestamps : true } )

module.exports = mongoose.model('Projects', ProjectSchema, 'Projects')