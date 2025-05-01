const ProjectModel = require('../models/ProjectsModel');
const LoginModel = require('../models/LoginModel');
const AddProjectModel = require('../models/AddProjectModel');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb'); 

//POST Project

const submit_project = async (req, res) => {
    const {owner, 
        title, 
        description, 
        field,
        collaborators,
        requirements,
        fundingAmount,
        fundingSource,
        startDate,
        endDate,
        status,
        tags,
        skills  } = req.body;


    try{

        const project_model = await ProjectModel.create({owner, 
                                                        title, 
                                                        description, 
                                                        field,
                                                        collaborators,
                                                        requirements,
                                                        fundingAmount,
                                                        fundingSource,
                                                        startDate,
                                                        endDate,
                                                        status,
                                                        tags,
                                                        skills})
        res.status(200).json({
            project_model: project_model,
            _id: project_model._id})
        console.log("New Project Created!")
        //console.log(project_model._id)
    } catch (error) {
        res.status(400).json({error: error.message})
        console.log("Could Not Create Project!");
    }
}

//Post Mongo_id to retrieve projects
const retrieve_projects = async (req, res) => {
    const { id } = req.body;

    try {

        const AllProjects = await ProjectModel.find({ owner: id });  //Find the projects
        res.status(200).json(AllProjects)
        
    }
    catch(error) {
        res.status(400).json({error: error.message});
        console.log("Could Not Find Projects!")
    }
  
}

//POST Project id into user's project list
const add_project = async (req, res) => {
    const { user_id, project_id } = req.body; 

    try{
        const AddProject = await LoginModel.findByIdAndUpdate(
            user_id,
            { $push : {projects: project_id} },
            {new: true }
        );

        res.status(200).json(AddProject)
        console.log("Project Added!")

    }
    catch(error){
        res.status(400).json({error: error.message});
        console.log("Could Not Add Projects");
    }
}

module.exports = {
    submit_project,
    retrieve_projects,
    add_project
}