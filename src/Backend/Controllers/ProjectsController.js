const ProjectModel = require('../models/ProjectsModel')
const mongoose = require('mongoose')

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
        res.status(200).json(project_model)
        console.log("New Project Created!")
    } catch (error) {
        res.status(400).json({error: error.message})
        console.log("Could Not Create Project!")
    }
}

//GET Projects
const retrieve_project = async (req, res) => {
    //Discuss how projects are going to be retrieved i.e. through a query
}

module.exports = {
    submit_project
}