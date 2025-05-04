const ReviewModel = require("../ReviewModel");

module.exports = async function (context, req) {
    try {
        const AllReviews = await ReviewModel.find({});
        context.res = {
            status: 200,
            body: AllReviews
        };
    } catch (error) {
        context.res = {
            status: 400,
            body: { error: error.message }
        };
        context.log("Could Not Find Reviews!");
    }
};