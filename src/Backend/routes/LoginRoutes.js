const express = require('express')
const {
    submit_user,
    retrieve_user
} = require('../Controllers/LoginController')


const router = express.Router()  //create an instance of router

//retrieve user credentials
router.get('/', retrieve_user)

//Submit JWT to database
router.post('/', submit_user)

module.exports = router