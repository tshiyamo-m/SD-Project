const ProjectModel = require('../models/ProjectsModel');
const LoginModel = require('../models/LoginModel');
//const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Types: { ObjectId } } = require('mongoose');

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
        skills,
        Documents  } = req.body;


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
                                                        skills,
                                                        Documents})
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

const get_all_projects = async (req, res) => {
    try {
        const { id } = req.body;

        const projects = await ProjectModel.find({
            $or: [
                { owner: id },
                { collaborators: { $in: [id] } }
            ]
        }).sort({ updated: -1 }); // Sort by most recently updated

        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }

}

const retrieve_active_projects = async (req, res) => {
    const { status } = req.body;

    try {

        const AllProjects = await ProjectModel.find({ status: status });//Find the projects

        if (AllProjects && AllProjects.length != 0){
            for (const project of AllProjects){
                const user = await LoginModel.findOne({ 
                    _id: new mongoose.Types.ObjectId(project.owner) });
                
                const decoded = jwt.decode(user.token);

                //console.log(decoded);

                project.owner = decoded.name;
            }
            
        }

        res.status(200).json(AllProjects);

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


//POST Updated project into db
const update_project = async (req,res) => {
    
    try {
     
        const { Data } = req.body;

      // Prevent updating protected fields
        const { id, created, ...sanitizedUpdates } = Data.updates;
        
        const updatedProject = await mongoose.connection.db
            .collection('Projects') // Replace with your actual collection name
            .findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(Data.projectId) },
            { $set: sanitizedUpdates },
            { returnDocument: 'after' } // Returns the updated document
            );
            
        if (!updatedProject) {
            return res.status(404).json({ error: "Project not found" });
            
        }
        
        res.status(200).json({
            success: true,
            project: updatedProject.value 
        });
          

        } catch (err) {
            console.error("Update error:", err);
            res.status(500).json({ error: "Server error during update" });
        }


};    




module.exports = {
    submit_project,
    retrieve_projects,
    add_project,
    update_project,
    retrieve_active_projects,
    get_all_projects
}