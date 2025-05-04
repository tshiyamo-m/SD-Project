const MilestoneModel = require("../MilestoneModel");

module.exports = async function (context, req) {
    const { id } = req.body;

    try {
        const AllMilestones = await MilestoneModel.find({ projectId: id });
        context.res = {
            status: 200,
            body: AllMilestones
        };
    } catch (error) {
        context.res = {
            status: 400,
            body: { error: error.message }
        };
        context.log("Could Not Find Milestones!");
    }
};