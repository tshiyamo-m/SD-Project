const express = require('express')
const {
    submit_user
} = require('../Controllers/LoginController')


const router = express.Router()  //create an instance of router

//retrieve user credentials


//Submit JWT to database
router.post('/', submit_user)

module.exports = router