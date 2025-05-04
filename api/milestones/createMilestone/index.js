const MilestoneModel = require("../MilestoneModel");

module.exports = async function (context, req) {
    const {
        name,
        description,
        dueDate,
        assignedTo,
        projectId,
        status,
    } = req.body;

    try {
        const milestone_model = await MilestoneModel.create({
            name,
            description,
            dueDate,
            assignedTo,
            projectId,
            status,
        });

        context.res = {
            status: 200,
            body: {
                milestone_model: milestone_model,
                _id: milestone_model._id
            }
        };
        context.log("New Milestone Created!");
    } catch (error) {
        context.res = {
            status: 400,
            body: { error: error.message }
        };
        context.log("Could Not Create Milestone!");
    }
};