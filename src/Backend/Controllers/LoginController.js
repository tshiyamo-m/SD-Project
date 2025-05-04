const LoginModel = require('../models/LoginModel')
//const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
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
    const userId = "6813d05ff67ef87dd1c25893";

    try {

        const User = await LoginModel.findById(userId);
        res.status(200).json(User)

    }
    catch(error) {
        res.status(400).json({error: error.message});
        console.log("Could Not Find User!")
    }
}


module.exports = {
    submit_user,
    get_user
}