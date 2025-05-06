const MilestoneModel = require("../models/MilestoneModel");
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

module.exports = {
    submit_milestone,
    retrieve_milestone,
};