const LoginModel = require('../models/LoginModel')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');

//POST token
const submit_user = async (req, res) => {
    const { token } = req.body;
    
    //add token to db
    try{

        const allUsers = await LoginModel.find({}); //Wack, fix this later
        const decoded = jwt.decode(token);

        if (!decoded) {
            return res.status(400).json({ error: "Invalid token" });
        }
        
        const existingUser = allUsers.find(user => {
            const decodedUser = jwt.decode(user.token);
            return decodedUser.email === decoded.email;
        });
        
        if (existingUser) {
            console.log("User already exists, go to Homepage!")
        }
        else{
            const login_model = await LoginModel.create({token})
            res.status(200).json(login_model)
            console.log("User does not exist, creating user")
        }

    } catch (error) {
        res.status(400).json({error: error.message})
        console.log("POST Request FAILED")
    }
}

//GET 
const retrieve_user = async (req, res) => {
    const { email } = req.query
    const UserEmail = await LoginModel.findOne({email})

    if (!UserEmail){
        return res.status(404).json({error: 'User Does Not Exist, Creating New User'})
    }

    res.status(200).json(UserEmail)
}

//Delete a token
const delete_token = async (req, res) => {
    const delete__token = await LoginModel.deleteOne({})
}



module.exports = {
    submit_user,
    retrieve_user
}