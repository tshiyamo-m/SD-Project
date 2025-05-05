const express = require('express')
const {
    submit_user,
    return_users
} = require('../Controllers/LoginController')


const router = express.Router()  //create an instance of router

//retrieve user credentials


//Submit JWT to database
router.post('/', submit_user)

//Return list of users
router.post('/users', return_users);

module.exports = router