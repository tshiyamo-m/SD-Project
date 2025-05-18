const MilestoneModel = require("../models/MilestoneModel");
const mongoose = require("mongoose");
const submit_milestone = async (req, res) => {
    const {
        name,
        description,
        dueDate,
        assignedTo,
        projectId,
        status,
    } = req.body;


    try{

        const milestone_model = await MilestoneModel.create({
            name,
            description,
            dueDate,
            assignedTo,
            projectId,
            status,
        })
        res.status(200).json({
            milestone_model: milestone_model,
            _id: milestone_model._id})
        console.log("New Milestone Created!")
        //console.log(milestone_model._id)
    } catch (error) {
        res.status(400).json({error: error.message})
        console.log("Could Not Create Milestone!");
    }
}

//get all milestones for projects
const retrieve_milestone = async (req, res) => {
    const { id } = req.body;

    try {

        const AllMilestones = await MilestoneModel.find({ projectId: id });  //Find the milestones
        res.status(200).json(AllMilestones)

    }
    catch(error) {
        res.status(400).json({error: error.message});
        console.log("Could Not Find Milestones!")
    }

}

const update_status = async (req, res) => {
    try {
        const { userId, status } = req.body;

        // No need to sanitize isReviewer since it should be a string value, not an object

        const updatedMilestoneStatus = await mongoose.connection.db
            .collection('Milestone')
            .findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(userId) },
                { $set: { status : status } },
                { returnDocument: 'after' } // Returns the updated document
            );

        if (!updatedMilestoneStatus) {
            return res.status(404).json({ error: "Milestone not found" });
        }

        res.status(200).json({
            success: true,
            user: updatedMilestoneStatus // Return the updated user document
        });

    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: "Server error during milestone" });
    }

}

module.exports = {
    submit_milestone,
    retrieve_milestone,
    update_status
};