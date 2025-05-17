const express = require('express')
const {
    submit_user,
    get_user,
    get_all_users,
    update_is_reviewer,
    make_admin,
    return_users

} = require('../Controllers/LoginController')


const router = express.Router()  //create an instance of router

//retrieve user credentials


//Submit JWT to database
router.post('/', submit_user)
router.post('/getUser', get_user)
router.post('/getAllUsers', get_all_users)
router.post('/update_is_reviewer', update_is_reviewer)
router.post('/makeAdmin', make_admin)

//Return list of users
router.post('/users', return_users);

module.exports = router