const LoginModel = require('../models/LoginModel')
//const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
//const {ObjectId} = require("mongoose");

//POST token
const submit_user = async (req, res) => {
    const { token, projects} = req.body;
    
    //add token to db
    try{
        const allUsers = await LoginModel.find({});
        const decoded = jwt.decode(token);

        if (!decoded) {
            return res.status(400).json({ error: "Invalid token" });
        }
    
        const existingUser = allUsers.find(user => {
            const decodedUser = jwt.decode(user.token);
            return decodedUser.email === decoded.email;
        });
        
        if (existingUser) {
            console.log("User already exists, go to Homepage!");
            res.status(200).json(existingUser);
        }
        else{
            const login_model = await LoginModel.create({token, projects})
            res.status(200).json(login_model)
            console.log("User does not exist, creating user")
        }

    } catch (error) {
        console.error("Error in submit_user:", error);
        res.status(400).json({error: error.message})
        console.log("POST Request FAILED")
    }
}


//Delete a token
// const delete_token = async (req, res) => {
//
// }

const get_user = async (req, res) => {
    const findId= req.body.findId;

    try {

        const User = await LoginModel.findById(findId);
        res.status(200).json(User)

    }
    catch(error) {
        res.status(400).json({error: error.message});
        console.log("Could Not Find User!")
    }
}


const get_all_users = async (req, res) => {
    try {
        const User = await LoginModel.find({});
        res.status(200).json(User)

    }
    catch(error) {
        res.status(400).json({error: error.message});
        console.log("Could Not Find Users!")
    }
}

const update_is_reviewer = async (req, res) => {
    try {
        //const { userId, isReviewer } = req.body;
        const userId = req.body.userId;
        const isReviewer = req.body.isReviewer;

        // No need to sanitize isReviewer since it should be a string value, not an object

        const updatedUser = await mongoose.connection.db
            .collection('Users')
            .findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(userId) },
                { $set: { isReviewer: isReviewer } }, // Correct way to set the isReviewer field
                { returnDocument: 'after' } // Returns the updated document
            );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            success: true,
            user: updatedUser // Return the updated user document
        });

    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: "Server error during update" });
    }
};

const make_admin = async (req, res) => {
    try {
        const { userId } = req.body;

        // No need to sanitize isReviewer since it should be a string value, not an object

        const updatedUserAdmin = await mongoose.connection.db
            .collection('Users')
            .findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(userId) },
                { $set: { isAdmin : true } },
                { returnDocument: 'after' } // Returns the updated document
            );

        if (!updatedUserAdmin) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            success: true,
            user: updatedUserAdmin // Return the updated user document
        });

    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: "Server error during update" });
    }
};

// Get list of users

const return_users = async (req, res) => {

    try{
        const allUsers = await LoginModel.find({});
        res.status(200).json(allUsers);
        // if (!allUsers){
            
        //     return res.status(404).json({ error: "Users not found" });
        // }
        // else {
        //     const DecodedUsers = [];

        //     for (const user of allUsers) {
        //         const decoded = jwt.decode(user.token);
        //         const user_with_id = {_id: user._id, ...decoded}
        //         DecodedUsers.push(user_with_id);
        //     }

        //     res.status(200).json(DecodedUsers);

        // }
    }
    catch(error){
        res.status(404).json({error: error.message})
    }
}



module.exports = {
    submit_user,
    get_user,
    get_all_users,
    update_is_reviewer,
    make_admin,
    return_users

}