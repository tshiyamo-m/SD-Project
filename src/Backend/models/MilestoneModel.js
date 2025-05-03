const mongoose = require('mongoose')

const Schema = mongoose.Schema //function to create a new schema

const milestoneSchema = new Schema({  //Layout of schema
    name: {
        type: String,
        required: true
    },
    description: {
        type:String,
        required: true
    },
    dueDate: {
        type:String,
        required: true
    },
    assignedTo: {
        type:String,
        required: true
    },
    projectId: {
        type: String,
        required: true
    },
    status: {
        type:String,
        required: true,
        default: "In Progress"
    },
}, { timestamps : true } ) //timestamp argument gives a 'date created' attribute to a document created in the db

module.exports = mongoose.model('Milestone', milestoneSchema, 'Milestone')
