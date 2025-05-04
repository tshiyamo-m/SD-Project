const ReviewModel = require("../ReviewModel");

module.exports = async function (context, req) {
    const {
        projectId,
        reviewerId,
        rating,
        comment,
        date,
        type,
    } = req.body;

    try {
        const review_model = await ReviewModel.create({
            projectId,
            reviewerId,
            rating,
            comment,
            date,
            type,
        });
        
        context.res = {
            status: 200,
            body: {
                review_model: review_model,
                _id: review_model._id
            }
        };
        context.log("New Review Created!");
    } catch (error) {
        context.res = {
            status: 400,
            body: { error: error.message }
        };
        context.log("Could Not Create Review!");
    }
};