const FinanceModel = require("../models/FinanceModel");
const mongoose = require("mongoose");
const submit_finance = async (req, res) => {
    const {
        amount,
        used,
        userId,
        source,
        purpose,
    } = req.body;


    try{

        const finance_model = await FinanceModel.create({
            amount,
            used,
            userId,
            source,
            purpose,
        })
        res.status(200).json({
            finance_model: finance_model,
            _id: finance_model._id})
        console.log("New Finance Record Created!")
        //console.log(milestone_model._id)
    } catch (error) {
        res.status(400).json({error: error.message})
        console.log("Could Not Create Finance Record!");
    }
}

//get all milestones for projects
const retrieve_finance = async (req, res) => {
    const { id } = req.body;

    try {

        const AllFinanceRecords = await FinanceModel.find({ userId: id });  //Find the milestones
        res.status(200).json(AllFinanceRecords)

    }
    catch(error) {
        res.status(400).json({error: error.message});
        console.log("Could Not Find Finance Records!")
    }

}

const update_finance = async (req, res) => {
    try {
        const id = req.body.id;
        const used = req.body.used;

        const updatedFund = await mongoose.connection.db
            .collection('Finance')
            .findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(id) },
                { $set: { used: used } },
                { returnDocument: 'after' }
            );

        if (!updatedFund) {
            return res.status(404).json({ error: "Fund not found" });
        }

        res.status(200).json({
            success: true,
            user: updatedFund
        });

    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: "Server error during update" });
    }
};

module.exports = {
    submit_finance,
    retrieve_finance,
    update_finance,
};