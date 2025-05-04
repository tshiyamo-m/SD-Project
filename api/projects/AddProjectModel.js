const mongoose = require('mongoose')

const Schema = mongoose.Schema //function to create a new schema

const AddProjectSchema = new Schema({//Layout of schema

    user_id: {
        type: String,
        required: true
    },
    
    project_id: {
        type: String,
        required: true
    }

}, { timestamps : true } )

module.exports = mongoose.model('AddProjects', AddProjectSchema, 'Projects') 