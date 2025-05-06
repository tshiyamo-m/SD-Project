const ReviewModel = require("../models/ReviewModel");
const submit_review = async (req, res) => {
    const {
        projectId,
        reviewerId,
        rating,
        comment,
        date,
        type,
    } = req.body;


    try{

        const review_model = await ReviewModel.create({
            projectId,
            reviewerId,
            rating,
            comment,
            date,
            type,
        })
        res.status(200).json({
            review_model: review_model,
            _id: review_model._id})
        console.log("New Review Created!")
        //console.log(review_model._id)
    } catch (error) {
        res.status(400).json({error: error.message})
        console.log("Could Not Create Review!");
    }
}

const retrieve_reviews_researcher = async (req, res) => {
    const { id } = req.body;

    try {

        const AllReviews = await ReviewModel.find({ projectId: id });  //Find the projects
        res.status(200).json(AllReviews)

    }
    catch(error) {
        res.status(400).json({error: error.message});
        console.log("Could Not Find Reviews!")
    }
}

const get_all_reviews = async (req, res) => {

    try {

        const AllReviews = await ReviewModel.find({});
        res.status(200).json(AllReviews)

    }
    catch(error) {
        res.status(400).json({error: error.message});
        console.log("Could Not Find Reviews!")
    }
}



module.exports = {
    submit_review,
    retrieve_reviews_researcher,
    get_all_reviews,
}