const ProjectModel = require('./ProjectsModel');
const LoginModel = require('../LoginModel');
const mongoose = require('mongoose');

// Submit Project
module.exports.submit_project = async (context, req) => {
    const {
        owner, 
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
        Documents
    } = req.body;

    try {
        const project_model = await ProjectModel.create({
            owner, 
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
            Documents
        });
        
        context.res = {
            status: 200,
            body: {
                project_model: project_model,
                _id: project_model._id
            }
        };
        context.log("New Project Created!");
    } catch (error) {
        context.res = {
            status: 400,
            body: { error: error.message }
        };
        context.log.error("Could Not Create Project:", error.message);
    }
};

// Retrieve projects by owner ID
module.exports.retrieve_projects = async (context, req) => {
    const ownerId = req.query.owner;
    
    try {
        if (!ownerId) {
            context.res = {
                status: 400,
                body: { error: "owner query parameter is required" }
            };
            return;
        }

        const projects = await ProjectModel.find({ owner: ownerId });
        context.res = { status: 200, body: projects };
    } catch(error) {
        context.res = { 
            status: 400, 
            body: { error: error.message }
        };
        context.log.error("Retrieve Projects Error:", error);
    }
};

// Retrieve active projects
module.exports.retrieve_active_projects = async (context, req) => {
    const status = req.query.status;
    
    try {
        if (!status) {
            context.res = {
                status: 400,
                body: { error: "status query parameter is required" }
            };
            return;
        }

        const projects = await ProjectModel.find({ status: status });
        context.res = { status: 200, body: projects };
    } catch(error) {
        context.res = { 
            status: 400, 
            body: { error: error.message }
        };
        context.log.error("Retrieve Active Projects Error:", error);
    }
};

// Update project
module.exports.update_project = async (context, req) => {
    try {
        const { updates, projectId } = req.body;
        
        if (!updates || !projectId) {
            context.res = {
                status: 400,
                body: { error: "updates and projectId are required" }
            };
            return;
        }

        const { id, created, ...sanitizedUpdates } = updates;
        
        const updatedProject = await mongoose.connection.db
            .collection('Projects')
            .findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(projectId) },
                { $set: sanitizedUpdates },
                { returnDocument: 'after' }
            );
            
        if (!updatedProject) {
            context.res = {
                status: 404,
                body: { error: "Project not found" }
            };
            return;
        }
        
        context.res = {
            status: 200,
            body: {
                success: true,
                project: updatedProject.value
            }
        };
    } catch (err) {
        context.log.error("Update error:", err);
        context.res = {
            status: 500,
            body: { error: "Server error during update" }
        };
    }
};

// Add project to user
module.exports.add_project = async (context, req) => {
    // Validate request body
    if (!req.body || !req.body.user_id || !req.body.project_id) {
        context.res = {
            status: 400,
            body: {
                success: false,
                error: "Missing required fields: user_id and project_id must be provided"
            }
        };
        return;
    }

    const { user_id, project_id } = req.body;

    try {
        // Validate IDs are valid MongoDB ObjectIds
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            throw new Error("Invalid user_id format");
        }

        if (!mongoose.Types.ObjectId.isValid(project_id)) {
            throw new Error("Invalid project_id format");
        }

        // Add project to user's project list
        const updatedUser = await LoginModel.findByIdAndUpdate(
            user_id,
            { $addToSet: { projects: project_id } },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            context.res = {
                status: 404,
                body: {
                    success: false,
                    error: "User not found"
                }
            };
            return;
        }

        context.res = {
            status: 200,
            body: {
                success: true,
                user: updatedUser
            }
        };

    } catch (error) {
        context.log.error(`Error adding project: ${error.message}`);
        
        context.res = {
            status: 500,
            body: {
                success: false,
                error: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        };
    }
};